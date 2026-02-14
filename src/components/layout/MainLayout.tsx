'use client';

import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import { Search } from 'lucide-react';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = usePOS();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <Sidebar />
      <main className="flex-1 p-4 lg:p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
