import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { runQuery } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getServerSession(authOptions as any);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-light">
        <Header />
        <main className="container-max py-24">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-text-muted mt-4">You must sign in as an admin to view this page.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // basic server-side counts for admin dashboard
  const pendingRequests = runQuery('SELECT COUNT(*) as c FROM request_submissions WHERE status = "RECEIVED"')[0]?.c || 0;
  const pendingSuggestions = runQuery('SELECT COUNT(*) as c FROM suggestions WHERE status = "RECEIVED"')[0]?.c || 0;
  const pendingReviews = runQuery('SELECT COUNT(*) as c FROM reviews WHERE status = "PENDING"')[0]?.c || 0;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="container-max py-12">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded border"> 
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <p className="text-2xl font-bold mt-4">{pendingRequests}</p>
          </div>
          <div className="bg-white p-6 rounded border"> 
            <h3 className="text-lg font-semibold">Pending Suggestions</h3>
            <p className="text-2xl font-bold mt-4">{pendingSuggestions}</p>
          </div>
          <div className="bg-white p-6 rounded border"> 
            <h3 className="text-lg font-semibold">Pending Reviews</h3>
            <p className="text-2xl font-bold mt-4">{pendingReviews}</p>
          </div>
        </div>
        <p className="text-text-muted mt-8">Manage submissions, reviews, and CSV imports from this dashboard.</p>
      </main>
      <Footer />
    </div>
  );
}
