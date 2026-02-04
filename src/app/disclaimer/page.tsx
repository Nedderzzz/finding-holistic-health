import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="flex-1 container-max py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Medical Disclaimer</h1>
          
          <div className="prose prose-sm max-w-none space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Important Information</h2>
              <p>
                Finding Health is an informational directory. It does not provide medical advice, diagnosis, or treatment. 
                Information presented on this website is community-contributed and may not be fully accurate or up to date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Medical Advice Disclaimer</h2>
              <p>
                The information, products, and services provided on Finding Health are not intended to diagnose, treat, cure, 
                or prevent any disease. Always consult a licensed healthcare professional for medical concerns, before making 
                any changes to your health regimen, or if you have questions about your health.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">User-Generated Content</h2>
              <p>
                Reviews and provider listings on this website are contributed by users and may not reflect accurate, complete, 
                or current information. Finding Health does not verify the credentials, qualifications, or practices of listed 
                providers. Listings do not imply endorsement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">No Endorsement</h2>
              <p>
                Finding Health does not endorse any particular provider, treatment, or practice. Reviews reflect the opinions 
                of individual users based on their personal experiences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Limitation of Liability</h2>
              <p>
                Finding Health is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any 
                damages arising from the use of this website or reliance on its content, including reliance on provider listings 
                or user reviews.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Your Responsibility</h2>
              <p>
                It is your responsibility to verify the qualifications, credentials, and services of any provider before seeking 
                treatment. Always verify licensing and any professional credentials directly with the provider or relevant 
                regulatory bodies.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
