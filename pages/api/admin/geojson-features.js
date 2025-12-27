import fs from 'fs';
import path from 'path';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  // JWT token authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  
  if (!decoded || decoded.role !== 'admin') {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  switch (req.method) {
    case 'GET':
      try {
        // Determine which GeoJSON file to use
        const { dataset } = req.query;
        let fileName;
        if (dataset === 'admin1' || dataset === 'regions') {
          fileName = 'regions_10m.geojson';
        } else {
          fileName = 'countries_10.geojson';
          const altPath = path.join(process.cwd(), 'maps', 'countries_10m.geojson');
          if (fs.existsSync(altPath)) {
            fileName = 'countries_10m.geojson';
          }
        }
        
        // Check maps folder first (for write operations), then public folder
        let filePath = path.join(process.cwd(), 'maps', fileName);
        if (!fs.existsSync(filePath)) {
          filePath = path.join(process.cwd(), 'public', 'maps', fileName);
        }
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: `GeoJSON file not found: ${fileName}` });
        }

        const fileContents = fs.readFileSync(filePath, 'utf8');
        const geoData = JSON.parse(fileContents);

        // Return features with their properties for editing
        const features = (geoData.features || []).map((feature, index) => ({
          index,
          properties: feature.properties,
          name: feature.properties.NAME || feature.properties.ADMIN || 'Unknown'
        }));

        res.status(200).json({
          fileName,
          features,
          totalFeatures: features.length
        });
      } catch (error) {
        console.error('Error reading GeoJSON:', error);
        res.status(500).json({ error: 'Failed to read GeoJSON file' });
      }
      break;

    case 'PUT':
      try {
        const { featureIndex, ISO_A2, ISO_A3, fileName: targetFileName } = req.body;

        if (featureIndex === undefined || featureIndex === null) {
          return res.status(400).json({ error: 'featureIndex is required' });
        }

        // Determine which GeoJSON file to use
        let fileName = targetFileName || 'countries_10.geojson';
        const altPath = path.join(process.cwd(), 'maps', 'countries_10m.geojson');
        if (!targetFileName && fs.existsSync(altPath)) {
          fileName = 'countries_10m.geojson';
        }
        
        // Always use maps folder for write operations
        const filePath = path.join(process.cwd(), 'maps', fileName);
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ error: `GeoJSON file not found: ${fileName}` });
        }

        // Read the GeoJSON file
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const geoData = JSON.parse(fileContents);

        if (!geoData.features || featureIndex >= geoData.features.length) {
          return res.status(400).json({ error: 'Invalid feature index' });
        }

        // Update the feature properties
        const feature = geoData.features[featureIndex];
        if (ISO_A2 !== undefined) {
          feature.properties.ISO_A2 = ISO_A2 === '' || ISO_A2 === null ? null : ISO_A2;
        }
        if (ISO_A3 !== undefined) {
          feature.properties.ISO_A3 = ISO_A3 === '' || ISO_A3 === null ? null : ISO_A3;
        }

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(geoData, null, 2), 'utf8');

        res.status(200).json({
          success: true,
          feature: {
            index: featureIndex,
            properties: feature.properties,
            name: feature.properties.NAME || feature.properties.ADMIN || 'Unknown'
          }
        });
      } catch (error) {
        console.error('Error updating GeoJSON:', error);
        res.status(500).json({ error: 'Failed to update GeoJSON file: ' + error.message });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}

