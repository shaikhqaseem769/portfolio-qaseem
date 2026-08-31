import type { Metadata } from 'next';
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import portfolioData from '@/data/portfolio.json';
import HexBackground from '@/components/HexBackground/HexBackground';
import CustomCursor from '@/components/CustomCursor/CustomCursor';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: portfolioData.seo.title,
  description: portfolioData.seo.description,
  openGraph: {
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
    url: portfolioData.seo.siteUrl,
    images: [{ url: portfolioData.seo.ogImage }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: portfolioData.seo.title,
    description: portfolioData.seo.description,
    images: [portfolioData.seo.ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-black text-white font-sans">
        <HexBackground />
        <CustomCursor />
        <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
