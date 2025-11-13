import { withContentCollections } from "@content-collections/next";

/** @type {import('next').NextConfig} */

// Define the base configuration for Next.js
const nextConfig = {
  // if environment is cloudcannon enable output: export
  output: process.env.ENVIRONMENT === "cloudcannon" ? "export" : "standalone",
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.ENVIRONMENT === "cloudcannon",
  },
};

// Export the final configuration
export default withContentCollections(nextConfig);
