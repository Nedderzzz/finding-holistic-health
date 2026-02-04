"use client";

import { useState } from 'react';

export default function ImportPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<any | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const f = (document.getElementById('csv') as HTMLInputElement).files?.[0];
    if (!f) return setStatus('No file selected');
    setStatus('Uploading...');
    const fd = new FormData();
    fd.append('file', f);
    const res = await fetch('/api/admin/providers/import', { method: 'POST', body: fd });
    const json = await res.json();
    if (res.ok) {
      setStatus('Import completed');
      setPreview(json);
    } else {
      setStatus(json.error || 'Import failed');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <main className="container-max py-12">
        <h1 className="text-3xl font-bold mb-6">CSV Import</h1>
        <form onSubmit={handleUpload} className="bg-white p-6 rounded border max-w-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium">CSV File</label>
            <input id="csv" type="file" accept=".csv,text/csv" className="mt-2" />
          </div>
          <div>
            <button className="px-4 py-2 bg-primary text-white rounded">Upload CSV</button>
          </div>
        </form>

        {status && <div className="mt-6">{status}</div>}

        {preview && (
          <div className="mt-6 bg-white p-4 rounded border max-w-3xl">
            <h3 className="font-semibold mb-2">Import Summary</h3>
            <pre className="text-sm">{JSON.stringify(preview, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  );
}
