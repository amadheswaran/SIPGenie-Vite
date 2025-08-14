import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function SipVsLumpsum(){
  useEffect(()=>{document.title='SIP vs Lumpsum — SIPGenie';const meta=document.querySelector('meta[name="description"]'); if(meta) meta.setAttribute('content','Compare SIP vs Lumpsum investment approaches with examples and calculators.');},[]);
  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">SIP vs Lumpsum</h1>
        <p className="mt-4">Placeholder comparison page for SIP and Lumpsum investment strategies.</p>
      </main>
      <Footer />
    </div>
  );
}
