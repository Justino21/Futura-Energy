/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Naked domain → https www (canonical)
      {
        source: '/:path*',
        has: [{ type: 'header', key: 'host', value: 'futuranrg.com' }],
        destination: 'https://www.futuranrg.com/:path*',
        permanent: true,
      },
      // HTTP → HTTPS for www
      {
        source: '/:path*',
        has: [
          { type: 'header', key: 'host', value: 'www.futuranrg.com' },
          { type: 'header', key: 'x-forwarded-proto', value: 'http' },
        ],
        destination: 'https://www.futuranrg.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
