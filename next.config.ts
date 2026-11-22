import type { NextConfig } from "next";

const apiOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const authenticatedApiRewrites = apiOrigin
  ? [
      {
        source: "/api/admin/:path*",
        destination: `${apiOrigin}/api/admin/:path*`,
      },
      {
        source: "/api/vendor/:path*",
        destination: `${apiOrigin}/api/vendor/:path*`,
      },
      {
        source: "/api/customer/:path*",
        destination: `${apiOrigin}/api/customer/:path*`,
      },
      {
        source: "/api/favorites/:path*",
        destination: `${apiOrigin}/api/favorites/:path*`,
      },
      {
        source: "/api/orders/:path*",
        destination: `${apiOrigin}/api/orders/:path*`,
      },
    ]
  : [];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  rewrites() {
    return {
      afterFiles: authenticatedApiRewrites,
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh4.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh5.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh6.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;