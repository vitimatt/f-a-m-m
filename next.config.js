/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This will be enabled during build on Netlify
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig

