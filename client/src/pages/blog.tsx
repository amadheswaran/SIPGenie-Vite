import { Calculator, BookOpen } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function BlogPage() {
  useEffect(()=>{ document.title = 'SIP Investment Blog — SIPGenie'; const meta = document.querySelector('meta[name="description"]'); if(meta) meta.setAttribute('content','SIPGenie blog — insights on SIPs, mutual funds, tax tips and investment strategies'); const kw = document.querySelector('meta[name="keywords"]'); if(kw) kw.setAttribute('content','SIP calculator, SIP blog, mutual funds, SIP tips, SIP step up, SIP calculator India'); }, []);
  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      <Header />

      {/* Blog Header */}
      <section className="py-12 bg-gradient-to-br from-[hsl(162,100%,41%)]/5 to-[hsl(207,90%,54%)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4">
              SIP Investment Blog
            </h1>
            <p className="text-lg sm:text-xl text-[hsl(220,8.9%,46.1%)] max-w-3xl mx-auto">
              Learn about SIP investing, wealth building strategies, and financial planning with our expert guides
            </p>
          </div>
        </div>
      </section>

      {/* Blog Articles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(162,100%,41%)]/10 to-[hsl(162,100%,41%)]/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-[hsl(162,100%,41%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/best-sip-funds-2025" className="text-[hsl(224,71.4%,4.1%)] hover:underline">Best SIP Funds for 2025</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Discover top-performing SIP mutual funds for 2025 with detailed analysis, risk assessment, and expert recommendations.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-[hsl(162,100%,41%)]/10 text-[hsl(162,100%,41%)] px-2 py-1 rounded-full">Investment</span>
                </div>
              </div>
            </div>

            {/* Blog Post 2 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(207,90%,54%)]/10 to-[hsl(207,90%,54%)]/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-[hsl(207,90%,54%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/sip-vs-fixed-deposit" className="text-[hsl(224,71.4%,4.1%)] hover:underline">SIP vs Fixed Deposit: Which is Better?</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Complete comparison between SIP investments and Fixed Deposits with returns analysis, risk factors, and tax implications.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-[hsl(207,90%,54%)]/10 text-[hsl(207,90%,54%)] px-2 py-1 rounded-full">Comparison</span>
                </div>
              </div>
            </div>

            {/* Blog Post 3 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/how-to-make-money-with-sips" className="text-[hsl(224,71.4%,4.1%)] hover:underline">How to Make Money with SIPs</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Step-by-step guide to building wealth through systematic investment plans with practical tips and real examples.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full">Guide</span>
                </div>
              </div>
            </div>

            {/* Blog Post 4 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(162,100%,41%)]/10 to-[hsl(162,100%,41%)]/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-[hsl(162,100%,41%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/sip-tax-benefits" className="text-[hsl(224,71.4%,4.1%)] hover:underline">SIP Tax Benefits You Should Know</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Understand tax saving opportunities with ELSS SIPs, Section 80C benefits, and long-term capital gains tax.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-[hsl(162,100%,41%)]/10 text-[hsl(162,100%,41%)] px-2 py-1 rounded-full">Tax Planning</span>
                </div>
              </div>
            </div>

            {/* Blog Post 5 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[hsl(207,90%,54%)]/10 to-[hsl(207,90%,54%)]/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-[hsl(207,90%,54%)]" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/common-sip-mistakes" className="text-[hsl(224,71.4%,4.1%)] hover:underline">Common SIP Mistakes to Avoid</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Learn about the most common SIP investment mistakes and how to avoid them for better returns and financial growth.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-[hsl(207,90%,54%)]/10 text-[hsl(207,90%,54%)] px-2 py-1 rounded-full">Tips</span>
                </div>
              </div>
            </div>

            {/* Blog Post 6 */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="p-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/10 to-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="text-xl text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-[hsl(224,71.4%,4.1%)] mb-3"><a href="/blog/sip-for-retirement-planning" className="text-[hsl(224,71.4%,4.1%)] hover:underline">SIP for Retirement Planning</a></h3>
                <p className="text-[hsl(220,8.9%,46.1%)] mb-4 leading-relaxed">
                  Plan your retirement with SIPs - calculate corpus needed, choose right funds, and build a secure financial future.
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Coming Soon</span>
                  <span className="text-xs bg-purple-500/10 text-purple-500 px-2 py-1 rounded-full">Retirement</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-[hsl(162,100%,41%)]/5 to-[hsl(207,90%,54%)]/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4">
            Ready to Start Your SIP Journey?
          </h2>
          <p className="text-xl text-[hsl(220,8.9%,46.1%)] mb-8 max-w-2xl mx-auto">
            Use our advanced SIP calculator to plan your investments and build wealth systematically
          </p>
          <Button 
            className="bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105"
            onClick={() => window.location.href = '/sip-calculator'}
            data-testid="button-start-calculating"
          >
            <Calculator className="mr-2 h-5 w-5" />
            Start Calculating Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
