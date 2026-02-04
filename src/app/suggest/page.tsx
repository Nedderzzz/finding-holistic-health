"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type FormData = {
  businessName: string;
  providerName?: string;
  city: string;
  state: string;
  phone?: string;
  website?: string;
  notes?: string;
  specialties?: string;
  suggestedBy?: string;
};

export default function SuggestPage() {
  const { register, handleSubmit } = useForm<FormData>();
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(data: FormData) {
    try {
      const payload = {
        businessName: data.businessName,
        providerName: data.providerName,
        city: data.city,
        state: data.state,
        phone: data.phone,
        website: data.website,
        notes: data.notes,
        specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()) : [],
        suggestedBy: data.suggestedBy,
      };

      const res = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) setMessage('Thanks — suggestion received.'); else setMessage(json.error || 'Failed');
    } catch (err) {
      setMessage('Submission failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="flex-1 container-max py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-neutral-lighter">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">Suggest a Provider</h1>
          <p className="text-text-muted mb-6">Know a great holistic health practitioner? Suggest them to help others in your community discover quality care.</p>

          {message && <div className="mb-4 text-sm text-primary">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark">Business / Provider Name</label>
              <input {...register('businessName', { required: true })} className="w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark">Provider's Name (optional)</label>
              <input {...register('providerName')} className="w-full mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark">City</label>
                <input {...register('city', { required: true })} className="w-full mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark">State (2-letter)</label>
                <input {...register('state', { required: true })} className="w-full mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Phone (optional)</label>
              <input {...register('phone')} className="w-full mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Website (optional)</label>
              <input {...register('website')} className="w-full mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Your email (optional)</label>
              <input {...register('suggestedBy')} className="w-full mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Notes (optional)</label>
              <textarea {...register('notes')} className="w-full mt-1" rows={4} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Specialties (comma separated)</label>
              <input {...register('specialties')} className="w-full mt-1" />
            </div>

            <div>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Send Suggestion</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
