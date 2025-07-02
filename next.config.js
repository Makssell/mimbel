/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Reasonable limit for compressed images
    },
  },
}

module.exports = nextConfig 