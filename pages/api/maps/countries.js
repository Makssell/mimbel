/**
 * API route for serving GeoJSON map data
 * 
 * This route redirects to static files in the public folder to avoid
 * Next.js API route size limits. Large GeoJSON files (>4MB) should be
 * served as static assets for better performance.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { dataset } = req.query;
    
    let fileName;
    if (dataset === 'admin1' || dataset === 'regions') {
      fileName = 'regions_10m.geojson';
    } else {
      // Default to countries
      fileName = 'countries_10.geojson';
    }
    
    // Redirect to static file in public folder
    // Next.js will serve this with proper caching and compression
    const staticPath = `/maps/${fileName}`;
    
    // Use 307 Temporary Redirect to preserve query parameters if needed
    res.redirect(307, staticPath);
  } catch (error) {
    console.error('Error redirecting to GeoJSON:', error);
    res.status(500).json({ error: 'Failed to load GeoJSON file' });
  }
}

