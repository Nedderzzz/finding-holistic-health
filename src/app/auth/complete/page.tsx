"use client";

import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

type FormData = { firstName: string; lastName: string };

export default function CompleteProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormData>();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && !(session as any)?.user?.needsProfile) {
      router.push('/');
    }
  }, [status, session, router]);

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch('/api/account/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const j = await res.json();
      if (res.ok) {
        setMessage('Profile updated');
        // refresh session
        setTimeout(() => router.push('/'), 800);
      } else {
        setMessage(j.error || 'Failed to update');
      }
    } catch (err) {
      setMessage('Failed to update');
    }
  }

  if (status === 'loading') return <div className="p-8">Loading...</div>;
  if (!session) return <div className="p-8">Please sign in first.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-light">
      <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Complete your profile</h2>
        <p className="text-text-muted mb-4">Please provide your first and last name to complete your account before posting reviews.</p>
        {message && <div className="mb-3 text-sm text-primary">{message}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">First name</label>
            <input {...register('firstName', { required: true })} className="w-full mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last name</label>
            <input {...register('lastName', { required: true })} className="w-full mt-1" />
          </div>
          <div>
            <button className="px-4 py-2 bg-primary text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
