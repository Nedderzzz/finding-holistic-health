'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfileRedirect() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.needsProfile) {
      // if not already on auth/complete page, redirect
      if (!pathname?.includes('/auth/complete')) {
        router.push('/auth/complete');
      }
    }
  }, [status, session, pathname, router]);

  return null;
}
