/** @type {import('next').NextConfig} */
const nextConfig = {
  // Proxy /api/* ke Express backend saat development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/:path*`,
      },
    ]
  },
  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
}

export default nextConfig
