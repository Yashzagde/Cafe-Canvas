import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Cafe Canva - Next-Gen Cafe Management',
  description: 'Manage your cafe, orders, and digital menu with beautiful ease.',
  manifest: '/manifest.json',
  other: {
    'theme-color': '#d97706',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} antialiased bg-mesh text-foreground`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
