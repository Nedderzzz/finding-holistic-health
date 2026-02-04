'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-dark text-neutral-light mt-24">
      <div className="container-max py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4">Finding Health</h3>
            <p className="text-sm text-text-muted">
              Discover holistic healthcare providers in your area.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/providers" className="hover:text-primary transition-colors">Directory</a></li>
              <li><a href="/request" className="hover:text-primary transition-colors">Submit Provider</a></li>
              <li><a href="/suggest" className="hover:text-primary transition-colors">Suggest Provider</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="/disclaimer" className="hover:text-primary transition-colors">Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <p className="text-sm"><a href="/contact" className="hover:text-primary transition-colors">Contact Us</a></p>
            <p className="text-sm text-text-muted mt-2">nedcaffarra@yahoo.com</p>
          </div>
        </div>
        <div className="border-t border-neutral-lighter pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-text-muted">
          <p>&copy; {currentYear} Finding Health. All rights reserved.</p>
          <p className="mt-4 sm:mt-0">Designed for holistic wellness discovery</p>
        </div>
      </div>
    </footer>
  );
}
