import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProviderCard } from '@/components/ProviderCard';
import Link from 'next/link';

export default function Home() {
  // Sample featured providers - will be replaced with real data
  const featuredProviders = [
    {
      id: '1',
      businessName: 'Harmony Acupuncture',
      providerName: 'Dr. Sarah Chen',
      city: 'Boulder',
      state: 'CO',
      avgRating: 4.8,
      reviewCount: 24,
      description: 'Traditional Chinese medicine and acupuncture for pain relief and wellness.',
      specialties: ['Acupuncture', 'Traditional Chinese Medicine'],
    },
    {
      id: '2',
      businessName: 'Holistic Healing Center',
      providerName: 'James Wilson',
      city: 'Portland',
      state: 'OR',
      avgRating: 4.5,
      reviewCount: 18,
      description: 'Functional medicine and naturopathic approaches to health.',
      specialties: ['Functional Medicine', 'Naturopathy'],
    },
    {
      id: '3',
      businessName: 'Wellness Chiropractic',
      providerName: 'Dr. Michael Rodriguez',
      city: 'Austin',
      state: 'TX',
      avgRating: 4.6,
      reviewCount: 32,
      description: 'Chiropractic care and sports injury treatment.',
      specialties: ['Chiropractic', 'Massage Therapy'],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-secondary text-white py-20 sm:py-32">
        <div className="container-max text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-balance">
            Finding Health
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Finding holistic healthcare in your area
          </p>
          <p className="text-white/80 max-w-2xl mx-auto mb-12">
            Discover trusted practitioners of acupuncture, naturopathy, chiropractic, and other holistic wellness approaches. Community-reviewed and verified.
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="container-max">
          <div className="bg-neutral-light rounded-lg p-6">
            <h3 className="font-semibold text-neutral-dark mb-4">Search Providers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Business or provider name"
                className="w-full px-4 py-3 border border-neutral-lighter rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="text"
                placeholder="City"
                className="w-full px-4 py-3 border border-neutral-lighter rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <select className="w-full px-4 py-3 border border-neutral-lighter rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">Select State</option>
                <option value="AL">Alabama</option>
                <option value="AK">Alaska</option>
                <option value="AZ">Arizona</option>
                <option value="AR">Arkansas</option>
                <option value="CA">California</option>
              </select>
              <select className="w-full px-4 py-3 border border-neutral-lighter rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                <option value="">All Specialties</option>
                <option value="acupuncture">Acupuncture</option>
                <option value="naturopathy">Naturopathy</option>
                <option value="chiropractic">Chiropractic</option>
                <option value="functional-medicine">Functional Medicine</option>
                <option value="herbalism">Herbalism</option>
                <option value="massage">Massage Therapy</option>
                <option value="nutritionist">Nutritionist/Dietitian</option>
              </select>
            </div>
            <Link
              href="/providers"
              className="mt-4 inline-block px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Search All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 sm:py-24">
        <div className="container-max">
          <h3 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-4">
            Featured Providers
          </h3>
          <p className="text-text-muted mb-12">
            Discover some of our most reviewed and highest-rated practitioners
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {featuredProviders.map((provider) => (
              <ProviderCard key={provider.id} {...provider} />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/providers"
              className="inline-block px-8 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              View All Providers
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-neutral-lighter py-16 sm:py-24">
        <div className="container-max">
          <h3 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-12 text-center">
            Help Build Our Directory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Request Form CTA */}
            <div className="bg-white rounded-lg p-8 border-2 border-transparent hover:border-primary transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-primary">📋</span>
              </div>
              <h4 className="text-xl font-semibold text-neutral-dark mb-3">
                Submit Your Practice
              </h4>
              <p className="text-text-muted mb-6">
                Are you a holistic healthcare provider? Get listed in our directory to reach patients seeking your services.
              </p>
              <Link
                href="/request"
                className="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
              >
                Submit Your Business
              </Link>
            </div>

            {/* Suggestion Form CTA */}
            <div className="bg-white rounded-lg p-8 border-2 border-transparent hover:border-secondary transition-colors">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-secondary">💡</span>
              </div>
              <h4 className="text-xl font-semibold text-neutral-dark mb-3">
                Recommend a Provider
              </h4>
              <p className="text-text-muted mb-6">
                Know a great holistic health practitioner? Suggest them to help others in your community discover quality care.
              </p>
              <Link
                href="/suggest"
                className="inline-block px-6 py-2 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark transition-colors"
              >
                Suggest a Provider
              </Link>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Important Disclaimer:</strong> Finding Health is an informational directory. It does not provide medical advice, diagnosis, or treatment. Information is community-contributed and may not be fully accurate. Always consult a licensed healthcare professional for medical concerns.{' '}
              <Link href="/disclaimer" className="underline hover:no-underline">
                Learn more
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Why Finding Health */}
      <section className="py-16 sm:py-24">
        <div className="container-max">
          <h3 className="text-3xl sm:text-4xl font-bold text-neutral-dark mb-12 text-center">
            Why Choose Finding Health?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⭐',
                title: 'Community Reviews',
                description: 'Read verified reviews and ratings from real patients to make informed decisions.',
              },
              {
                icon: '🗺️',
                title: 'Easy Discovery',
                description: 'Find practitioners by location, specialty, and name with our intuitive search and filters.',
              },
              {
                icon: '✔️',
                title: 'Verified Listings',
                description: 'All listings are verified and moderated to ensure accuracy and quality.',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h4 className="text-lg font-semibold text-neutral-dark mb-2">
                  {item.title}
                </h4>
                <p className="text-text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
