/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
  },
};

module.exports = nextConfig;