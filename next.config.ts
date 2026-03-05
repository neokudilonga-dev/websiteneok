
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow images from Firebase Storage and placeholder domain
    remotePatterns: (() => {
      const patterns = [
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/biblioangola.appspot.com/o/**',
        },
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          port: '',
          pathname: '/v0/b/biblioangola.firebasestorage.app/o/**',
        },
        {
          protocol: 'https',
          hostname: 'placehold.co',
          port: '',
          pathname: '/**',
        },
      ];
      return patterns;
    })(),
    domains: (() => {
      const domains = ['firebasestorage.googleapis.com', 'placehold.co'];
      return domains;
    })(),
  },
  // Reduce dev noise and remove console statements in production
  reactStrictMode: false,
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
}

export default nextConfig

