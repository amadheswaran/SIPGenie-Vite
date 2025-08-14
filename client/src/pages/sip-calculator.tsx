import SIPCalculator from "@/components/sip-calculator";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Calculator } from "lucide-react";
import { useEffect } from 'react';

export default function SIPCalculatorPage() {
  useEffect(()=>{ document.title = 'SIP Calculator — SIPGenie'; const meta = document.querySelector('meta[name="description"]'); if(meta) meta.setAttribute('content','Interactive SIP calculator with step-up, timeline, and downloadable reports.'); const kw = document.querySelector('meta[name="keywords"]'); if(kw) kw.setAttribute('content','SIP calculator, step-up SIP, SIP calculator India, SIP to reach goal'); }, []);
  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />

      {/* Page Header */}
      <section className="py-12 bg-gradient-to-br from-[hsl(162,100%,41%)]/5 to-[hsl(207,90%,54%)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-page-title">
              SIP Calculator
            </h1>
            <p className="text-lg sm:text-xl text-[hsl(220,8.9%,46.1%)] max-w-3xl mx-auto">
              Plan, Track & Grow Your Wealth with Smart SIP Tools
            </p>
          </div>
        </div>
      </section>

      {/* Main Calculator Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SIPCalculator />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
