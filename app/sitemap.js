// app/sitemap.js
export default function sitemap() {
  return [
    {
      url: 'https://ariastudholding.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: 'https://ariastudholding.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/%D8%A7%D9%84%D9%80%D8%A7%D8%B3%D9%80%D8%A7%D9%81',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/chart',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/design',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/quiz',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/game',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://ariastudholding.com/news',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  ];
}