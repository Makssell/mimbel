import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically import the map component to avoid SSR issues with Leaflet
const MapTester = dynamic(() => import('../maps/maptests'), {
  ssr: false,
  loading: () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      Loading map...
    </div>
  )
});

export default function MapTestPage() {
  return (
    <>
      <Head>
        <title>Map Tester - GeoJSON Data Testing</title>
        <meta name="description" content="Interactive map for testing GeoJSON country and state data" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <style jsx global>{`
          .state-tooltip {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid #333;
            border-radius: 4px;
            padding: 4px 8px;
            font-size: 12px;
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          }
        `}</style>
      </Head>
      <MapTester />
    </>
  );
}

