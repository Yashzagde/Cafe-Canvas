'use client';

import { useEffect } from 'react';

export default function IndexPage() {
  useEffect(() => {
    // Standard Next.js client redirect
    window.location.href = '/store-admin/dashboard';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-xl border-4 border-accent-indigo border-t-transparent animate-spin"></div>
        <span className="text-sm font-semibold tracking-wide text-neutral-400">Loading Store Admin Panel...</span>
      </div>
    </div>
  );
}
