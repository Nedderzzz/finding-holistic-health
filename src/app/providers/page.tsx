import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { runQuery } from '@/lib/db';
import { ProviderCard } from '@/components/ProviderCard';

export default function ProvidersPage() {
  const providers = runQuery('SELECT * FROM providers WHERE status = "APPROVED" ORDER BY avg_rating DESC LIMIT 100');

  const parsed = providers.map((p: any) => ({
    ...p,
    specialties: (() => {
      try { return JSON.parse(p.specialties || '[]'); } catch { return []; }
    })(),
  }));

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="flex-1 container-max py-12">
        <h1 className="text-4xl font-bold text-neutral-dark mb-4">Provider Directory</h1>
        <p className="text-text-muted mb-8">Browse providers by location or specialty.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsed.map((p: any) => (
            <ProviderCard key={p.id} id={p.id} businessName={p.business_name} providerName={p.provider_name} city={p.city} state={p.state} avgRating={p.avg_rating || 0} reviewCount={p.review_count || 0} description={p.description} specialties={p.specialties} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
