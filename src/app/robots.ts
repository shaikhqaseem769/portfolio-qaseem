import { MetadataRoute } from 'next';
import portfolioData from '@/data/portfolio.json';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${portfolioData.seo.siteUrl}/sitemap.xml`,
  };
}
