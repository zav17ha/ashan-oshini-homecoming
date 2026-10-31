import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { qualities: [75, 90] },
  // The share-image routes read these files from disk at request time.
  outputFileTracingIncludes: {
    "/**": ["./lib/og-fonts/**/*", "./lib/og-assets/**/*"],
  },
  async headers() {
    return [
      { source: "/generator", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/responses", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
};

export default nextConfig;
