import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/example"],
      disallow: ["/dashboard", "/admin", "/connect", "/api"],
    },
    sitemap: "https://trysima.uz/sitemap.xml",
  };
}
