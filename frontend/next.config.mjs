/** @type {import('next').NextConfig} */
const nextConfig = {
  // Backend menyatu di dalam Next.js (route handler di src/app/api/*),
  // jadi tidak perlu proxy/rewrite ke server eksternal.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
}

export default nextConfig
