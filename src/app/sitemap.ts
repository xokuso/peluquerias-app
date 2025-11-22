import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://peluquerias-web.com'

  // Static pages
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/plantillas`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    // Note: /checkout is excluded as it's noindex
  ]

  // You can add dynamic routes here if needed
  // For example, if you have individual template pages or blog posts
  const dynamicRoutes: MetadataRoute.Sitemap = [
    // Example for individual template pages if they exist
    // {
    //   url: `${baseUrl}/templates/elegante-dorado`,
    //   lastModified: new Date(),
    //   changeFrequency: 'monthly',
    //   priority: 0.6,
    // },
  ]

  return [...staticRoutes, ...dynamicRoutes]
}