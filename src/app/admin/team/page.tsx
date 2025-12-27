'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function TeamManagementRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the first team page by default
    router.replace('/admin/team/writing');
  }, [router]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <p>Redirecting...</p>
    </div>
  );
}
