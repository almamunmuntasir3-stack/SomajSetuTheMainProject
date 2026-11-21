/** Next.js configuration for the ShomajSetu frontend. */
const nextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Keep these hosts in sync with OPTIMIZED_HOSTS in src/lib/eventImages.js.
  // Any other valid image URL is still rendered via next/image `unoptimized`
  // rather than being replaced with a shared fallback.
  images: {
    remotePatterns: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "images.pexels.com",
      "i.imgur.com",
      "res.cloudinary.com",
    ].map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
  },
};

module.exports = nextConfig;
