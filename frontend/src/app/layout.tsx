import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Cafe Canva - Next-Gen Cafe Management',
  description: 'Manage your cafe, orders, and digital menu with beautiful ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-mesh text-foreground`}>
        {children}
      </body>
    </html>
  );
}
