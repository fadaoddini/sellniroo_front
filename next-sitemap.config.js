/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://ariastudholding.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/dashboard/*', '/profile/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        allow: '/api/',
      },
      {
        userAgent: '*',
        disallow: ['/admin/', '/dashboard/', '/profile/'],
      },
    ],
    additionalSitemaps: [
      'https://ariastudholding.com/sitemap.xml',
    ],
  },
  changefreq: 'weekly',
  priority: 0.7,
  sitemapSize: 5000,
  generateIndexSitemap: true,
}
