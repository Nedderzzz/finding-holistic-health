import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import MapView from '@/components/Map';
import { runSingle, runQuery } from '@/lib/db';
import { formatDate } from '@/lib/utils';

type ProviderRow = any;

export default async function ProviderDetail({ params }: { params: { id: string } }) {
  const id = params.id;

  const provider = runSingle<ProviderRow>('SELECT * FROM providers WHERE id = ? AND status = "APPROVED"', [id]);

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-light">
        <Header />
        <main className="container-max py-24">
          <h1 className="text-2xl font-semibold">Provider not found</h1>
          <p className="text-text-muted mt-4">This provider may be pending approval or does not exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const reviews = runQuery('SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.provider_id = ? AND r.status = "APPROVED" AND r.is_visible = 1 ORDER BY r.created_at DESC', [id]);

  const specialties = (() => {
    try {
      return JSON.parse(provider.specialties || '[]');
    } catch (e) {
      return [];
    }
  })();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />

      <main className="container-max py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-neutral-lighter">
            <h1 className="text-3xl font-bold mb-2">{provider.business_name}</h1>
            <p className="text-text-muted mb-4">{provider.provider_name} — {provider.city}, {provider.state}</p>

            <p className="mb-4 text-text-muted">{provider.description}</p>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Reviews</h3>
              {reviews.length === 0 && <p className="text-text-muted">No reviews yet.</p>}
              <ul className="space-y-4">
                {reviews.map((r: any) => (
                  <li key={r.id} className="bg-neutral-light p-4 rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{`${r.first_name} ${r.last_name.charAt(0)}.`}</div>
                      <div className="text-sm text-text-muted">{formatDate(r.created_at)}</div>
                    </div>
                    <div className="text-text-muted">{r.content}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="bg-white p-6 rounded-lg border border-neutral-lighter">
            <h4 className="font-semibold mb-2">Contact</h4>
            <p className="text-text-muted mb-1"><a href={`tel:${provider.phone}`} className="underline">{provider.phone}</a></p>
            {provider.website && (
              <p className="text-text-muted mb-3"><a href={provider.website} target="_blank" rel="noopener noreferrer" className="underline">Visit website</a></p>
            )}

            {specialties.length > 0 && (
              <div className="mb-4">
                <h5 className="font-semibold">Specialties</h5>
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((s: string) => (
                    <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <h5 className="font-semibold mb-2">Location</h5>
              <div className="h-48 rounded overflow-hidden border">
                <MapView latitude={provider.latitude} longitude={provider.longitude} city={provider.city} state={provider.state} />
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
