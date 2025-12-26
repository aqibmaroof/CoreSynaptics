import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    domains: [
      "wildtag-s3-bucket.s3.eu-north-1.amazonaws.com",
    ],
  },
};

export default nextConfig;
