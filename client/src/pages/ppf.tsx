import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PPF() {
  useEffect(() => {
    document.title = 'PPF Calculator — SIPGenie';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Public Provident Fund (PPF) calculator to estimate returns and maturity.');
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">PPF Calculator</h1>
        <p className="mt-4">This is a placeholder for the PPF calculator. We'll port your PPF tools here.</p>
      </main>
      <Footer />
    </div>
  );
}