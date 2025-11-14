import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", 
 experimental:{
  turbopackFileSystemCacheForDev: true,
 }
};

export default nextConfig;
