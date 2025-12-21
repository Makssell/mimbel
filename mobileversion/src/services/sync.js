import * as SQLite from "expo-sqlite";
import { supabase } from "./supabase";

// Open database
const db = SQLite.openDatabaseSync("mimbel.db");

class SyncService {
  constructor() {
    this.initDatabase();
  }

  // Check if a column exists in a table
  columnExists(tableName, columnName) {
    try {
      const result = db.getFirstSync(
        `PRAGMA table_info(${tableName})`
      );
      // PRAGMA table_info returns array of column info
      const columns = db.getAllSync(`PRAGMA table_info(${tableName})`);
      return columns.some(col => col.name === columnName);
    } catch (error) {
      return false;
    }
  }

  // Migrate database schema (remove old columns if they exist)
  migrateDatabase() {
    try {
      // Check if flags table has updated_at column (old schema)
      const flagsHasUpdatedAt = this.columnExists('flags', 'updated_at');
      const flagsHasFileName = this.columnExists('flags', 'fileName');
      const continentsHasUpdatedAt = this.columnExists('continents', 'updated_at');

      if (flagsHasUpdatedAt || flagsHasFileName || continentsHasUpdatedAt) {
        console.log("Old schema detected, migrating database...");
        
        // SQLite doesn't support DROP COLUMN easily, so we'll recreate the tables
        // First, backup data if needed (for future use)
        // For now, just drop and recreate since we're syncing from Supabase anyway
        db.runSync("DROP TABLE IF EXISTS flag_continents");
        db.runSync("DROP TABLE IF EXISTS flags");
        db.runSync("DROP TABLE IF EXISTS continents");
        // Also drop regional tables if they exist with old schema
        db.runSync("DROP TABLE IF EXISTS regional_flags");
        db.runSync("DROP TABLE IF EXISTS region_division_types");
        db.runSync("DROP TABLE IF EXISTS regional_flag_countries");
        console.log("Old tables dropped, will recreate with new schema");
      }
    } catch (error) {
      console.error("Error during migration:", error);
      // If migration fails, try to continue anyway
    }
  }

  // Initialize database schema
  initDatabase() {
    try {
      // Run migration first to handle old schema
      this.migrateDatabase();

      // Create flags table (matching Supabase schema, without unused fileName)
      db.runSync(`
        CREATE TABLE IF NOT EXISTS flags (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          territory INTEGER DEFAULT 0,
          image_url TEXT,
          synced_at TEXT
        )
      `);

      // Create continents table (matching Supabase schema)
      db.runSync(`
        CREATE TABLE IF NOT EXISTS continents (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          synced_at TEXT
        )
      `);

      // Create flag-continent relationships (matching Supabase schema: country_continent)
      db.runSync(`
        CREATE TABLE IF NOT EXISTS flag_continents (
          flag_id INTEGER NOT NULL,
          continent_id INTEGER NOT NULL,
          PRIMARY KEY (flag_id, continent_id),
          FOREIGN KEY (flag_id) REFERENCES flags(id),
          FOREIGN KEY (continent_id) REFERENCES continents(id)
        )
      `);

      // Create regional flag countries table
      db.runSync(`
        CREATE TABLE IF NOT EXISTS regional_flag_countries (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          flag_image_url TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT,
          synced_at TEXT
        )
      `);

      // Create region division types table
      db.runSync(`
        CREATE TABLE IF NOT EXISTS region_division_types (
          id INTEGER PRIMARY KEY,
          country_id INTEGER NOT NULL,
          type_name TEXT NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TEXT,
          synced_at TEXT,
          FOREIGN KEY (country_id) REFERENCES regional_flag_countries(id)
        )
      `);

      // Create regional flags table
      db.runSync(`
        CREATE TABLE IF NOT EXISTS regional_flags (
          id INTEGER PRIMARY KEY,
          country_id INTEGER NOT NULL,
          division_type_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          image_url TEXT NOT NULL,
          abbreviation TEXT,
          code TEXT,
          created_at TEXT,
          synced_at TEXT,
          FOREIGN KEY (country_id) REFERENCES regional_flag_countries(id),
          FOREIGN KEY (division_type_id) REFERENCES region_division_types(id)
        )
      `);

      // Create sync metadata table
      db.runSync(`
        CREATE TABLE IF NOT EXISTS sync_metadata (
          table_name TEXT PRIMARY KEY,
          last_sync_at TEXT NOT NULL
        )
      `);

      // Create game history table (local only)
      db.runSync(`
        CREATE TABLE IF NOT EXISTS game_history (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_mode TEXT NOT NULL,
          game_type TEXT NOT NULL,
          score INTEGER,
          total_attempts INTEGER,
          accuracy REAL,
          time_elapsed INTEGER,
          game_data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create best scores table (local only)
      db.runSync(`
        CREATE TABLE IF NOT EXISTS best_scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          game_mode TEXT NOT NULL,
          game_type TEXT NOT NULL,
          score INTEGER,
          game_data TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(game_mode, game_type)
        )
      `);

      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  // Get last sync time for a table
  getLastSyncTime(tableName) {
    try {
      const result = db.getFirstSync(
        `SELECT last_sync_at FROM sync_metadata WHERE table_name = ?`,
        [tableName]
      );
      
      return result ? result.last_sync_at : null;
    } catch (error) {
      console.error(`Error getting last sync time for ${tableName}:`, error);
      return null;
    }
  }

  // Update last sync time
  updateLastSyncTime(tableName, timestamp) {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO sync_metadata (table_name, last_sync_at) VALUES (?, ?)`,
        [tableName, timestamp]
      );
    } catch (error) {
      console.error(`Error updating last sync time for ${tableName}:`, error);
    }
  }

  // Sync flags from Supabase
  async syncFlags() {
    try {
      console.log("Starting flag sync from Supabase...");

      // Query flags with continent relationships (matching flagLoader.js pattern)
      const { data, error } = await supabase
        .from("flags")
        .select(`
          id,
          name,
          territory,
          image_url,
          country_continent(
            continent_id
          )
        `)
        .order('id');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No flags found in Supabase");
        return { success: true, count: 0, message: "No flags to sync" };
      }

      console.log(`Found ${data.length} flags in Supabase, syncing...`);

      // Insert/update flags in local database
      this.updateLocalFlags(data);

      // Update sync time
      const now = new Date().toISOString();
      this.updateLastSyncTime("flags", now);

      return { success: true, count: data.length, message: `Synced ${data.length} flags` };
    } catch (error) {
      console.error("Sync flags error:", error);
      return { success: false, error: error.message };
    }
  }

  // Update local flags database
  updateLocalFlags(flags) {
    try {
      db.withTransactionSync(() => {
        flags.forEach((flag) => {
          // Insert or update flag (matching Supabase schema, without unused fileName)
          db.runSync(
            `INSERT OR REPLACE INTO flags (id, name, territory, image_url, synced_at) VALUES (?, ?, ?, ?, ?)`,
            [
              flag.id,
              flag.name,
              flag.territory ? 1 : 0,
              flag.image_url || null,
              new Date().toISOString()
            ]
          );

          // Update flag-continent relationships
          if (flag.country_continent && flag.country_continent.length > 0) {
            // First, remove existing relationships for this flag
            db.runSync(
              `DELETE FROM flag_continents WHERE flag_id = ?`,
              [flag.id]
            );

            // Then, insert new relationships
            flag.country_continent.forEach((cc) => {
              db.runSync(
                `INSERT OR IGNORE INTO flag_continents (flag_id, continent_id) VALUES (?, ?)`,
                [flag.id, cc.continent_id]
              );
            });
          }
        });
      });

      console.log(`Updated ${flags.length} flags in local database`);
    } catch (error) {
      console.error("Error updating local flags:", error);
      throw error;
    }
  }

  // Get local flags count
  getLocalFlagsCount() {
    try {
      const result = db.getFirstSync(
        `SELECT COUNT(*) as count FROM flags`
      );
      return result ? result.count : 0;
    } catch (error) {
      console.error("Error getting local flags count:", error);
      return 0;
    }
  }

  // Get local flags (for testing)
  getLocalFlags(limit = 10) {
    try {
      // Try to get flags - if table structure is wrong, it will fail gracefully
      const result = db.getAllSync(
        `SELECT id, name, territory, image_url, synced_at FROM flags ORDER BY id LIMIT ?`,
        [limit]
      );
      return result || [];
    } catch (error) {
      console.error("Error getting local flags:", error);
      // If there's a schema mismatch, suggest recreating the database
      if (error.message && error.message.includes("no such column")) {
        console.warn("Database schema mismatch detected. You may need to clear app data and restart.");
      }
      return [];
    }
  }

  // Get local regional flags count
  getLocalRegionalFlagsCount() {
    try {
      const result = db.getFirstSync(
        `SELECT COUNT(*) as count FROM regional_flags`
      );
      return result ? result.count : 0;
    } catch (error) {
      console.error("Error getting local regional flags count:", error);
      return 0;
    }
  }

  // Get local regional flags (for testing)
  getLocalRegionalFlags(limit = 10) {
    try {
      const result = db.getAllSync(
        `SELECT id, name, country_id, division_type_id, image_url, synced_at FROM regional_flags ORDER BY id LIMIT ?`,
        [limit]
      );
      return result || [];
    } catch (error) {
      console.error("Error getting local regional flags:", error);
      return [];
    }
  }

  // Get local regional countries count
  getLocalRegionalCountriesCount() {
    try {
      const result = db.getFirstSync(
        `SELECT COUNT(*) as count FROM regional_flag_countries`
      );
      return result ? result.count : 0;
    } catch (error) {
      console.error("Error getting local regional countries count:", error);
      return 0;
    }
  }

  // Helper method to drop and recreate database (for development/testing)
  // WARNING: This will delete all local data!
  resetDatabase() {
    try {
      console.log("Resetting database...");
      db.execSync("DROP TABLE IF EXISTS flag_continents");
      db.execSync("DROP TABLE IF EXISTS flags");
      db.execSync("DROP TABLE IF EXISTS continents");
      db.execSync("DROP TABLE IF EXISTS regional_flags");
      db.execSync("DROP TABLE IF EXISTS region_division_types");
      db.execSync("DROP TABLE IF EXISTS regional_flag_countries");
      db.execSync("DROP TABLE IF EXISTS sync_metadata");
      this.initDatabase();
      console.log("Database reset complete");
      return { success: true, message: "Database reset successfully" };
    } catch (error) {
      console.error("Error resetting database:", error);
      return { success: false, error: error.message };
    }
  }

  // Sync continents from Supabase
  async syncContinents() {
    try {
      console.log("Starting continents sync from Supabase...");

      const { data, error } = await supabase
        .from("continents")
        .select("id, name")
        .order('id');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No continents found in Supabase");
        return { success: true, count: 0, message: "No continents to sync" };
      }

      console.log(`Found ${data.length} continents in Supabase, syncing...`);

      // Insert/update continents in local database
      db.withTransactionSync(() => {
        data.forEach((continent) => {
          db.runSync(
            `INSERT OR REPLACE INTO continents (id, name, synced_at) VALUES (?, ?, ?)`,
            [continent.id, continent.name, new Date().toISOString()]
          );
        });
      });

      // Update sync time
      const now = new Date().toISOString();
      this.updateLastSyncTime("continents", now);

      return { success: true, count: data.length, message: `Synced ${data.length} continents` };
    } catch (error) {
      console.error("Sync continents error:", error);
      return { success: false, error: error.message };
    }
  }

  // Sync regional flag countries from Supabase
  async syncRegionalCountries() {
    try {
      console.log("Starting regional countries sync from Supabase...");

      const { data, error } = await supabase
        .from("regional_flag_countries")
        .select("id, name, flag_image_url, is_active, created_at")
        .eq("is_active", true)
        .order('name');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No regional countries found in Supabase");
        return { success: true, count: 0, message: "No regional countries to sync" };
      }

      console.log(`Found ${data.length} regional countries in Supabase, syncing...`);

      // Insert/update regional countries in local database
      db.withTransactionSync(() => {
        data.forEach((country) => {
          db.runSync(
            `INSERT OR REPLACE INTO regional_flag_countries (id, name, flag_image_url, is_active, created_at, synced_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              country.id,
              country.name,
              country.flag_image_url,
              country.is_active ? 1 : 0,
              country.created_at || null,
              new Date().toISOString()
            ]
          );
        });
      });

      // Update sync time
      const now = new Date().toISOString();
      this.updateLastSyncTime("regional_flag_countries", now);

      return { success: true, count: data.length, message: `Synced ${data.length} regional countries` };
    } catch (error) {
      console.error("Sync regional countries error:", error);
      return { success: false, error: error.message };
    }
  }

  // Sync region division types from Supabase
  async syncDivisionTypes() {
    try {
      console.log("Starting division types sync from Supabase...");

      const { data, error } = await supabase
        .from("region_division_types")
        .select("id, country_id, type_name, is_active, created_at")
        .eq("is_active", true)
        .order('type_name');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No division types found in Supabase");
        return { success: true, count: 0, message: "No division types to sync" };
      }

      console.log(`Found ${data.length} division types in Supabase, syncing...`);

      // Insert/update division types in local database
      db.withTransactionSync(() => {
        data.forEach((divisionType) => {
          db.runSync(
            `INSERT OR REPLACE INTO region_division_types (id, country_id, type_name, is_active, created_at, synced_at) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              divisionType.id,
              divisionType.country_id,
              divisionType.type_name,
              divisionType.is_active ? 1 : 0,
              divisionType.created_at || null,
              new Date().toISOString()
            ]
          );
        });
      });

      // Update sync time
      const now = new Date().toISOString();
      this.updateLastSyncTime("region_division_types", now);

      return { success: true, count: data.length, message: `Synced ${data.length} division types` };
    } catch (error) {
      console.error("Sync division types error:", error);
      return { success: false, error: error.message };
    }
  }

  // Sync regional flags from Supabase (all flags, not filtered by is_active)
  async syncRegionalFlags() {
    try {
      console.log("Starting regional flags sync from Supabase...");

      // Only select columns that exist in Supabase (abbreviation and code may not exist)
      const { data, error } = await supabase
        .from("regional_flags")
        .select("id, country_id, division_type_id, name, image_url, created_at")
        .order('name');

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log("No regional flags found in Supabase");
        return { success: true, count: 0, message: "No regional flags to sync" };
      }

      console.log(`Found ${data.length} regional flags in Supabase, syncing...`);

      // Insert/update regional flags in local database
      db.withTransactionSync(() => {
        data.forEach((flag) => {
          db.runSync(
            `INSERT OR REPLACE INTO regional_flags (id, country_id, division_type_id, name, image_url, abbreviation, code, created_at, synced_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              flag.id,
              flag.country_id,
              flag.division_type_id,
              flag.name,
              flag.image_url,
              null, // abbreviation - not in Supabase
              null, // code - not in Supabase
              flag.created_at || null,
              new Date().toISOString()
            ]
          );
        });
      });

      // Update sync time
      const now = new Date().toISOString();
      this.updateLastSyncTime("regional_flags", now);

      return { success: true, count: data.length, message: `Synced ${data.length} regional flags` };
    } catch (error) {
      console.error("Sync regional flags error:", error);
      return { success: false, error: error.message };
    }
  }

  // Full sync (first time or manual refresh)
  async fullSync() {
    console.log("Starting full sync...");

    const results = {
      flags: await this.syncFlags(),
      continents: await this.syncContinents(),
      regionalCountries: await this.syncRegionalCountries(),
      divisionTypes: await this.syncDivisionTypes(),
      regionalFlags: await this.syncRegionalFlags(),
    };

    console.log("Full sync complete:", results);
    return results;
  }

  // Incremental sync (check for updates)
  // Note: Since flags table doesn't have updated_at, we do full sync each time
  // In the future, we could optimize by tracking which IDs we have locally
  async incrementalSync() {
    console.log("Starting incremental sync...");
    // For now, always do full sync since we don't have updated_at tracking
    return await this.fullSync();
  }
}

// Export singleton instance
export default new SyncService();
