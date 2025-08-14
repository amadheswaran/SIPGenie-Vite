import { useEffect } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function GoalCalculator(){
  useEffect(()=>{document.title='Goal Calculator — SIPGenie';const meta=document.querySelector('meta[name="description"]'); if(meta) meta.setAttribute('content','Goal-based investment calculator to reach your financial targets.');},[]);
  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />
      <main className="container mx-auto p-8">
        <h1 className="text-2xl font-bold">Goal Calculator</h1>
        <p className="mt-4">Placeholder for a goal-based investment calculator. Converts target corpus to required SIP.</p>
      </main>
      <Footer />
    </div>
  );
}
