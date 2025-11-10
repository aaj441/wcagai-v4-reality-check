/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@wcag-ai/core', '@wcag-ai/db', '@wcag-ai/utils'],
};

module.exports = nextConfig;
