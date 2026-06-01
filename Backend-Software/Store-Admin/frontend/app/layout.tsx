import React from 'react';
import './global.css';
import { SyncProvider } from '@/app/context/SyncContext';
import { LayoutShell } from '@/components/layout/LayoutShell';

export const metadata = {
  title: 'CafeCanvas — Store Admin',
  description: 'Multi-Tenant SaaS Hospitality Operating System — Store Administration Dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500;600;700&family=Sora:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <SyncProvider>
          <LayoutShell>{children}</LayoutShell>
        </SyncProvider>
      </body>
    </html>
  );
}
