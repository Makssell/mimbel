# Mobile Sync Implementation Example

This document shows how to implement the sync mechanism for the mobile app.

## Database Schema (SQLite)

```sql
-- Flags table
CREATE TABLE flags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  territory INTEGER DEFAULT 0,
  image_url TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);

-- Continents table
CREATE TABLE continents (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);

-- Flag-Continent relationships
CREATE TABLE flag_continents (
  flag_id INTEGER,
  continent_id INTEGER,
  PRIMARY KEY (flag_id, continent_id),
  FOREIGN KEY (flag_id) REFERENCES flags(id),
  FOREIGN KEY (continent_id) REFERENCES continents(id)
);

-- Regional countries
CREATE TABLE regional_countries (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT
);

-- Regional flags
CREATE TABLE regional_flags (
  id INTEGER PRIMARY KEY,
  country_id INTEGER,
  division_type_id INTEGER,
  name TEXT,
  image_url TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced_at TEXT,
  FOREIGN KEY (country_id) REFERENCES regional_countries(id)
);

-- Sync metadata
CREATE TABLE sync_metadata (
  table_name TEXT PRIMARY KEY,
  last_sync_at TEXT NOT NULL
);

-- Game history (local only)
CREATE TABLE game_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_mode TEXT NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER,
  total_attempts INTEGER,
  game_data TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Best scores (local only)
CREATE TABLE best_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_mode TEXT NOT NULL,
  game_type TEXT NOT NULL,
  score INTEGER,
  game_data TEXT, -- JSON
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(game_mode, game_type)
);
```

## Sync Service Implementation

```javascript
// services/sync.js
import * as SQLite from "expo-sqlite";
import { supabase } from "./supabase";

const db = SQLite.openDatabase("mimbel.db");

class SyncService {
  // Get last sync time for a table
  async getLastSyncTime(tableName) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT last_sync_at FROM sync_metadata WHERE table_name = ?",
          [tableName],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).last_sync_at);
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      });
    });
  }

  // Update last sync time
  async updateLastSyncTime(tableName, timestamp) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO sync_metadata (table_name, last_sync_at) 
           VALUES (?, ?)`,
          [tableName, timestamp],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Sync flags from Supabase
  async syncFlags() {
    try {
      const lastSync = await this.getLastSyncTime("flags");

      // Build query based on last sync
      let query = supabase
        .from("flags")
        .select("*, country_continent(continent_id), continents(name)");

      // If we have a last sync, only get updated records
      if (lastSync) {
        query = query.gte("updated_at", lastSync);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Insert/update flags in local database
      await this.updateLocalFlags(data);

      // Update sync time
      const now = new Date().toISOString();
      await this.updateLastSyncTime("flags", now);

      return { success: true, count: data.length };
    } catch (error) {
      console.error("Sync flags error:", error);
      return { success: false, error: error.message };
    }
  }

  // Update local flags database
  async updateLocalFlags(flags) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        flags.forEach((flag) => {
          // Insert or update flag
          tx.executeSql(
            `INSERT OR REPLACE INTO flags (id, name, territory, image_url, updated_at) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              flag.id,
              flag.name,
              flag.territory ? 1 : 0,
              flag.image_url,
              flag.updated_at,
            ]
          );

          // Update flag-continent relationships
          if (flag.country_continent) {
            flag.country_continent.forEach((cc) => {
              tx.executeSql(
                `INSERT OR IGNORE INTO flag_continents (flag_id, continent_id) 
                 VALUES (?, ?)`,
                [flag.id, cc.continent_id]
              );
            });
          }
        });

        tx.executeSql(
          "COMMIT",
          [],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }

  // Full sync (first time or manual refresh)
  async fullSync() {
    console.log("Starting full sync...");

    const results = {
      flags: await this.syncFlags(),
      continents: await this.syncContinents(),
      regionalCountries: await this.syncRegionalCountries(),
      regionalFlags: await this.syncRegionalFlags(),
    };

    console.log("Full sync complete:", results);
    return results;
  }

  // Incremental sync (check for updates)
  async incrementalSync() {
    console.log("Starting incremental sync...");

    // Only sync if we have a previous sync time
    const hasSyncedBefore = (await this.getLastSyncTime("flags")) !== null;

    if (!hasSyncedBefore) {
      // First time, do full sync
      return await this.fullSync();
    }

    // Otherwise, do incremental sync
    return await this.fullSync(); // For now, same as full sync
  }

  // Download and cache flag images
  async downloadFlagImages(flags) {
    const FileSystem = require("expo-file-system");
    const imageDir = `${FileSystem.documentDirectory}flags/`;

    // Ensure directory exists
    await FileSystem.makeDirectoryAsync(imageDir, { intermediates: true });

    const downloadPromises = flags.map(async (flag) => {
      try {
        const filename = `${flag.id}.jpg`;
        const localUri = `${imageDir}${filename}`;

        // Check if already downloaded
        const fileInfo = await FileSystem.getInfoAsync(localUri);
        if (fileInfo.exists) {
          return { flagId: flag.id, localUri, cached: true };
        }

        // Download image
        const downloadResult = await FileSystem.downloadAsync(
          flag.image_url,
          localUri
        );

        // Update database with local path
        await this.updateFlagImagePath(flag.id, downloadResult.uri);

        return { flagId: flag.id, localUri: downloadResult.uri, cached: false };
      } catch (error) {
        console.error(`Error downloading image for flag ${flag.id}:`, error);
        return { flagId: flag.id, error: error.message };
      }
    });

    return await Promise.all(downloadPromises);
  }

  // Update flag image path in database
  async updateFlagImagePath(flagId, localPath) {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE flags SET local_image_path = ? WHERE id = ?",
          [localPath, flagId],
          () => resolve(),
          (_, error) => reject(error)
        );
      });
    });
  }
}

export default new SyncService();
```

## Usage in React Native App

```javascript
// hooks/useSync.js
import { useState, useEffect } from "react";
import SyncService from "../services/sync";
import * as Network from "expo-network";

export const useSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle, syncing, success, error
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const sync = async (forceFullSync = false) => {
    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      // Check network connection
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        throw new Error("No internet connection");
      }

      // Perform sync
      const result = forceFullSync
        ? await SyncService.fullSync()
        : await SyncService.incrementalSync();

      if (result.flags.success) {
        setSyncStatus("success");
        setLastSyncTime(new Date().toISOString());
      } else {
        throw new Error("Sync failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      setSyncStatus("error");
    } finally {
      setIsSyncing(false);
    }
  };

  // Auto-sync on app launch (if online)
  useEffect(() => {
    const autoSync = async () => {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected) {
        await sync();
      }
    };

    autoSync();
  }, []);

  return {
    sync,
    isSyncing,
    syncStatus,
    lastSyncTime,
  };
};
```

## Sync API Endpoint (Alternative Approach)

If you prefer to use a custom API endpoint instead of direct Supabase:

```javascript
// pages/api/sync.js (Next.js API route)
import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const { last_sync, tables } = req.query;

  const results = {};

  try {
    // Sync flags
    if (!tables || tables.includes("flags")) {
      let flagsQuery = supabase
        .from("flags")
        .select("*, country_continent(continent_id), continents(name)");

      if (last_sync) {
        flagsQuery = flagsQuery.gte("updated_at", last_sync);
      }

      const { data: flags, error: flagsError } = await flagsQuery;
      if (flagsError) throw flagsError;

      results.flags = {
        new: flags.filter(
          (f) => !last_sync || new Date(f.created_at) > new Date(last_sync)
        ),
        updated: flags.filter(
          (f) =>
            last_sync &&
            new Date(f.updated_at) > new Date(last_sync) &&
            new Date(f.created_at) <= new Date(last_sync)
        ),
        deleted: [], // You'd need to track deletions separately
      };
    }

    // Sync continents
    if (!tables || tables.includes("continents")) {
      let continentsQuery = supabase.from("continents").select("*");
      if (last_sync) {
        continentsQuery = continentsQuery.gte("updated_at", last_sync);
      }

      const { data: continents, error: continentsError } =
        await continentsQuery;
      if (continentsError) throw continentsError;

      results.continents = continents;
    }

    // Add more tables as needed...

    res.status(200).json({
      success: true,
      sync_time: new Date().toISOString(),
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
```

## Sync Status Component

```javascript
// components/SyncStatus.js
import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSync } from "../hooks/useSync";

export const SyncStatus = () => {
  const { sync, isSyncing, syncStatus, lastSyncTime } = useSync();

  const getStatusColor = () => {
    switch (syncStatus) {
      case "syncing":
        return "#007AFF";
      case "success":
        return "#34C759";
      case "error":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "syncing":
        return "Syncing...";
      case "success":
        return "Up to date";
      case "error":
        return "Sync failed";
      default:
        return "Not synced";
    }
  };

  return (
    <View style={{ padding: 16, backgroundColor: "#F2F2F7", borderRadius: 8 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: getStatusColor(),
              marginRight: 8,
            }}
          />
          <Text style={{ fontSize: 14, color: "#000" }}>{getStatusText()}</Text>
        </View>

        {isSyncing ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <TouchableOpacity onPress={() => sync(true)}>
            <Text style={{ color: "#007AFF", fontSize: 14 }}>Sync Now</Text>
          </TouchableOpacity>
        )}
      </View>

      {lastSyncTime && (
        <Text style={{ fontSize: 12, color: "#8E8E93", marginTop: 4 }}>
          Last synced: {new Date(lastSyncTime).toLocaleString()}
        </Text>
      )}
    </View>
  );
};
```

## Initial Data Download Strategy

```javascript
// screens/OnboardingScreen.js
import React, { useState, useEffect } from "react";
import { View, Text, ProgressBar } from "react-native";
import SyncService from "../services/sync";

export const OnboardingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Downloading data...");

  useEffect(() => {
    const downloadInitialData = async () => {
      try {
        setStatus("Downloading flags...");
        const flagsResult = await SyncService.syncFlags();
        setProgress(0.3);

        setStatus("Downloading continents...");
        await SyncService.syncContinents();
        setProgress(0.5);

        setStatus("Downloading regional data...");
        await SyncService.syncRegionalCountries();
        setProgress(0.7);

        setStatus("Downloading images...");
        const flags = await SyncService.getAllFlags();
        await SyncService.downloadFlagImages(flags);
        setProgress(1.0);

        setStatus("Complete!");
        setTimeout(() => onComplete(), 1000);
      } catch (error) {
        console.error("Download error:", error);
        setStatus("Error: " + error.message);
      }
    };

    downloadInitialData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Welcome to Mimbel!</Text>
      <Text style={{ fontSize: 16, marginBottom: 20, color: "#666" }}>
        {status}
      </Text>
      <ProgressBar progress={progress} />
      <Text style={{ fontSize: 14, marginTop: 10, color: "#999" }}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
};
```

## Key Points

1. **Offline-First**: App works completely offline after initial sync
2. **Incremental Sync**: Only downloads changes since last sync
3. **Image Caching**: Downloads and stores images locally
4. **Error Handling**: Gracefully handles network errors
5. **Progress Feedback**: Shows sync status to user
6. **Background Sync**: Can sync in background when app opens

This approach ensures your app works offline while staying up-to-date when online!
