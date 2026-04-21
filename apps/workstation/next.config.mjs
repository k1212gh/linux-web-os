const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async rewrites() {
    return [
      { source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` },
      { source: '/ws/:path*', destination: `${BACKEND_URL}/ws/:path*` },
      { source: '/proxy/:path*', destination: `${BACKEND_URL}/proxy/:path*` },
    ]
  },

  webpack: (config) => {
    config.externals = config.externals || []
    return config
  },
}

export default nextConfig
