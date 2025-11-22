import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://peluquerias-web.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/templates',
        ],
        disallow: [
          '/checkout*',
          '/api*',
          '/admin*',
          '/_next*',
          '/private*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/templates',
        ],
        disallow: [
          '/checkout*',
          '/api*',
          '/admin*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}