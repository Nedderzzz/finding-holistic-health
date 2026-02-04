"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

type FormData = {
  businessName: string;
  providerName: string;
  city: string;
  state: string;
  phone: string;
  website?: string;
  description?: string;
  addressLine1?: string;
  zip?: string;
  specialties?: string; // comma-separated
};

export default function RequestPage() {
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
        description: data.description,
        addressLine1: data.addressLine1,
        zip: data.zip,
        specialties: data.specialties ? data.specialties.split(',').map(s => s.trim()) : [],
      };

      const res = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage('Thank you — your request has been submitted and is pending review.');
      } else {
        setMessage(json.error || 'Submission failed');
      }
    } catch (err) {
      setMessage('Submission failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="flex-1 container-max py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg border border-neutral-lighter">
          <h1 className="text-3xl font-bold text-neutral-dark mb-4">Submit Your Business</h1>
          <p className="text-text-muted mb-6">Are you a holistic healthcare provider? Fill out the form below to request being added to our directory.</p>

          {message && <div className="mb-4 text-sm text-primary">{message}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-dark">Business Name</label>
              <input {...register('businessName', { required: true })} className="w-full mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-dark">Provider's Name</label>
              <input {...register('providerName', { required: true })} className="w-full mt-1" />
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
              <label className="block text-sm font-medium text-neutral-dark">Phone</label>
              <input {...register('phone', { required: true })} className="w-full mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Website (optional)</label>
              <input {...register('website')} className="w-full mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Address (optional)</label>
              <input {...register('addressLine1')} className="w-full mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-dark">ZIP (optional)</label>
                <input {...register('zip')} className="w-full mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-dark">Specialties (comma separated)</label>
                <input {...register('specialties')} className="w-full mt-1" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-dark">Description (optional)</label>
              <textarea {...register('description')} className="w-full mt-1" rows={4} />
            </div>

            <div>
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded">Submit Request</button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
