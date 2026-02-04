'use client';

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-lighter sticky top-0 z-40">
      <nav className="container-max flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">FH</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-dark">
            Finding Health
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-8">
          <a href="/providers" className="text-neutral-dark hover:text-primary transition-colors">
            Directory
          </a>
          <a href="/request" className="text-neutral-dark hover:text-primary transition-colors">
            Submit Provider
          </a>
          <a href="/suggest" className="text-neutral-dark hover:text-primary transition-colors">
            Suggest Provider
          </a>
          <a href="/account" className="text-neutral-dark hover:text-primary transition-colors">
            Account
          </a>
        </div>
        <div className="sm:hidden">
          <button className="text-neutral-dark hover:text-primary">
            ☰
          </button>
        </div>
      </nav>
    </header>
  );
}
