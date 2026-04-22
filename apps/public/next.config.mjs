/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  transpilePackages: ['@k1212gh/ui', '@k1212gh/apps-public'],
  trailingSlash: true,
}

export default nextConfig
