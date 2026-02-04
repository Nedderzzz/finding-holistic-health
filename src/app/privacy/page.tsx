import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-light">
      <Header />
      <main className="flex-1 container-max py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Privacy Policy</h1>
          
          <div className="prose prose-sm max-w-none space-y-6 text-text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Information We Collect</h2>
              <p>
                Finding Health collects minimal personal information necessary to provide our service. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>First and last name (for user accounts)</li>
                <li>Email address (for authentication and communication)</li>
                <li>Reviews and ratings (user-submitted content)</li>
                <li>Usage data and browsing behavior (through standard web analytics)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">How We Use Your Information</h2>
              <p>We use collected information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Authenticate users and maintain accounts</li>
                <li>Publish reviews and user-generated content</li>
                <li>Moderate submissions for policy compliance</li>
                <li>Send necessary notifications and updates</li>
                <li>Improve and optimize our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Data Security</h2>
              <p>
                We implement appropriate security measures to protect your data. However, no method of transmission over the 
                internet is completely secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">User Rights</h2>
              <p>
                You have the right to access, update, or delete your account information at any time. You may also request 
                the removal of your reviews and content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-3">Contact Us</h2>
              <p>
                For privacy concerns or requests, please contact us at nedcaffarra@yahoo.com
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
