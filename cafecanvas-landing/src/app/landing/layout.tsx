import React from 'react';

export const metadata = {
  title: 'CafeCanvas - Revolutionize Your Restaurant Management',
  description: 'Say goodbye to order confusion, billing errors, and manual staff management. Complete control and 10x efficiency with CafeCanvas.',
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen font-sans text-gray-900 antialiased selection:bg-orange-500 selection:text-white">
      {children}
    </div>
  );
}
