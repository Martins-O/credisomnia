import './globals.css';
import { Providers } from './providers';
import { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
};

export const metadata: Metadata = {
  title: 'Credisomnia - DeFi Credit Scoring & Lending',
  description: 'Revolutionary DeFi credit scoring and lending platform with soulbound NFTs',
  metadataBase: new URL('https://credisomnia.com'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: '/apple-touch-icon.svg',
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/favicon.svg',
      },
      {
        rel: 'mask-icon',
        url: '/logo.svg',
        color: '#0ea5e9',
      },
      {
        rel: 'manifest',
        url: '/site.webmanifest',
      },
    ],
  },
  openGraph: {
    type: 'website',
    url: 'https://credisomnia.com/',
    title: 'Credisomnia - DeFi Credit Scoring & Lending',
    description: 'Revolutionary DeFi credit scoring and lending platform with soulbound NFTs',
    images: ['/og-image.svg'],
    siteName: 'Credisomnia',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Credisomnia - DeFi Credit Scoring & Lending',
    description: 'Revolutionary DeFi credit scoring and lending platform with soulbound NFTs',
    images: ['/og-image.svg'],
    creator: '@credisomnia',
  },
  other: {
    'font-display': 'swap',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="font-sans">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Providers>
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}