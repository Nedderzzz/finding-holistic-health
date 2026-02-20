'use client';

import { SessionProvider } from 'next-auth/react';
import ProfileRedirect from './ProfileRedirect';

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ProfileRedirect />
      {children}
    </SessionProvider>
  );
}
