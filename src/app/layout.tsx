import './global.sass';

import { ReactNode } from 'react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { GoogleAnalytics } from '@next/third-parties/google';

import { ScrollToTop } from '@/modules/scroll-to-top/scroll-to-top';
import { Providers } from '@/shared/providers/providers';
import { Popup } from '@/widgets/popup-test';

import './globals.css';

const Header = dynamic(() => import('@/widgets/header/ui'));
const Footer = dynamic(() => import('@/widgets/footer/ui'));

const baseUrl = process.env.NEXT_SITE_URL || 'https://dapp-dev-comp.woof.software';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),

  title: 'DeFi Made Simple: Crypto Lending & Borrowing | Compound',

  applicationName: 'Compound',

  description:
    'Compound - Your Key to DeFi. Lend, Borrow, and Earn Crypto With the Best Terms in the Market. Join the Future of Finance With Security at Its Core.',

  icons: {
    icon: '/logo.svg',
  },

  openGraph: {
    title: 'DeFi Made Simple: Crypto Lending & Borrowing | Compound',

    type: 'website',

    description:
      'Compound - Your Key to DeFi. Lend, Borrow, and Earn Crypto With the Best Terms in the Market. Join the Future of Finance With Security at Its Core.',

    images: '/meta/meta-tag.png',

    url: baseUrl,
  },

  twitter: {
    card: 'summary_large_image',

    site: '@compoundfinance',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <Providers>
          <Header />

          <GoogleAnalytics gaId='G-KC59Y9R901' />

          <ScrollToTop />

          {children}

          <Footer />

          <Popup />
        </Providers>
      </body>
    </html>
  );
}
