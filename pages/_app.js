// pages/_app.js
import '../styles/globals.css'; // Import global styles (if you have them)
import Navbar from '../components/Navbar'; // Import your common Navbar (optional)

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Navbar /> {/* Add the Navbar to all pages */}
      <Component {...pageProps} /> {/* This renders the specific page component */}
    </div>
  );
}

export default MyApp;
