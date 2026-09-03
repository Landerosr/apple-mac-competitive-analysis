import type { NextConfig } from 'next';

const pagesBuild = process.env.APPLE_PAGES_BUILD === '1';

const nextConfig: NextConfig = {
  output: pagesBuild ? 'export' : undefined,
  assetPrefix: pagesBuild ? '/apple-mac-competitive-analysis' : '',
  trailingSlash: true,
};

export default nextConfig;
