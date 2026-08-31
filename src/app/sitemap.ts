import { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: portfolioData.seo.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
