import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The catalog is read from disk at runtime, which file tracing can't see from
  // a computed path. Without this the CSV is missing from the deployed function.
  outputFileTracingIncludes: {
    '/api/chat': ['./data/phones.csv'],
  },
};

export default nextConfig;
