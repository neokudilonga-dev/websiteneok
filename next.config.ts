
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // typescript and eslint: fail build on errors
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
