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