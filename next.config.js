/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove invalid api configuration
  // API body parser limits should be configured in individual API routes
  output: 'standalone', // This helps with Vercel deployment
  experimental: {
    // Enable any experimental features if needed
  },
}

module.exports = nextConfig 