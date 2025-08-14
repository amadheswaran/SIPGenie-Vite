import { Calculator, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { useEffect } from 'react';
import Footer from "@/components/footer";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />

      {/* Coming Soon Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-bounce-in">
            <div className="w-24 h-24 bg-gradient-to-br from-[hsl(162,100%,41%)]/20 to-[hsl(207,90%,54%)]/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <TrendingUp className="text-4xl text-[hsl(162,100%,41%)]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[hsl(224,71.4%,4.1%)] mb-6">
              Compare Investment Strategies
            </h1>
            <p className="text-xl text-[hsl(220,8.9%,46.1%)] mb-8 max-w-2xl mx-auto">
              Coming Soon! Compare different SIP strategies, mutual funds, and investment plans to find what works best for your financial goals.
            </p>
            <Button 
              className="bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
              onClick={() => window.location.href = '/sip-calculator'}
              data-testid="button-try-calculator"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Try Our Calculator
            </Button>
          </div>
        </div>
      </section>

 <Footer />
    </div>
  );
}
