import { useState, useEffect } from "react";
import { Calculator, TrendingUp, Calendar, ChartLine, Sprout, Zap, Shield, Target, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SIPCalculator from "@/components/sip-calculator";
import FAQSection from "@/components/faq-section";

export default function Home() {
  useEffect(() => {
    document.title = 'Home — SIPGenie';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'SIPGenie — smart SIP calculator and comparison tools');
    const kw = document.querySelector('meta[name="keywords"]');
    if (kw) kw.setAttribute('content', 'SIP calculator, compare SIP, mutual funds, SIP calculator India');
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[hsl(220,14.3%,97%)]">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] bg-clip-text text-transparent">SIPGenie</span>
              </div>
              <div className="hidden md:flex space-x-12 absolute left-1/2 transform -translate-x-1/2">
                <a href="/sip-calculator" className="text-lg font-bold text-[hsl(224,71.4%,4.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">Calculator</a>
                <a href="/compare" className="text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">Compare</a>
                <a href="/blog" className="text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">Blog</a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                className="md:hidden p-2 rounded-lg text-[hsl(224,71.4%,4.1%)] hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-up">
            <div className="px-4 py-3 space-y-3">
              <a 
                href="/sip-calculator" 
                className="block py-3 text-lg font-bold text-[hsl(224,71.4%,4.1%)] hover:text-[hsl(162,100%,41%)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Calculator
              </a>
              <a 
                href="/compare" 
                className="block py-3 text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Compare
              </a>
              <a 
                href="/blog" 
                className="block py-3 text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[hsl(162,100%,41%)]/10 via-[hsl(207,90%,54%)]/5 to-purple-500/5 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-20 h-20 bg-[hsl(162,100%,41%)]/20 rounded-full blur-xl"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-[hsl(207,90%,54%)]/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 hero-title" data-testid="text-main-title">
              <span className="gradient-text-animated">
                SIPGenie
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[hsl(224,71.4%,4.1%)] mb-6 hero-subtitle">
              Your Smart Investment Companion
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-[hsl(220,8.9%,46.1%)] max-w-4xl mx-auto mb-8 leading-relaxed px-4" data-testid="text-hero-description">
              Plan, Track & Grow Your Wealth with Smart SIP Tools
            </p>
            <div className="flex justify-center mb-12">
              <Button 
                className="bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all transform hover:scale-105 animate-pulse-gentle"
                data-testid="button-start-calculating"
                onClick={() => {
                  window.history.pushState(null, '', '/sip-calculator');
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Start Calculating
              </Button>
            </div>
            
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-lift animate-float" style={{animationDelay: '0s'}}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text-animated" data-testid="text-stat-calculations">₹50L+</div>
                <div className="text-sm font-medium text-[hsl(220,8.9%,46.1%)] mt-2">Calculations Completed</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-lift animate-float" style={{animationDelay: '1s'}}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text-animated" data-testid="text-stat-returns">12%+</div>
                <div className="text-sm font-medium text-[hsl(220,8.9%,46.1%)] mt-2">Average Returns</div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover-lift animate-float" style={{animationDelay: '2s'}}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text-animated" data-testid="text-stat-users">10K+</div>
                <div className="text-sm font-medium text-[hsl(220,8.9%,46.1%)] mt-2">Happy Users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Calculator Section */}
      <section id="calculator" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SIPCalculator />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gradient-to-br from-[hsl(207,90%,54%)]/5 to-[hsl(162,100%,41%)]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-features-title">Why Choose SIPGenie?</h2>
            <p className="text-xl text-[hsl(220,8.9%,46.1%)] max-w-3xl mx-auto">
              Build your financial confidence with our smart, simple, and delightful investment tools
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="bg-white p-6 lg:p-8 rounded-2xl calculator-shadow text-center hover-lift feature-card animate-bounce-in" style={{animationDelay: '0.2s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(162,100%,41%)]/10 to-[hsl(162,100%,41%)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '0s'}}>
                <Calculator className="text-2xl text-[hsl(162,100%,41%)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-feature-calculator">Smart Calculator</h3>
              <p className="text-sm lg:text-base text-[hsl(220,8.9%,46.1%)] leading-relaxed">Calculate SIP returns with precision using our advanced algorithms and real-time data</p>
            </div>
            
            <div className="bg-white p-6 lg:p-8 rounded-2xl calculator-shadow text-center hover-lift feature-card animate-bounce-in" style={{animationDelay: '0.4s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-[hsl(207,90%,54%)]/10 to-[hsl(207,90%,54%)]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '1s'}}>
                <ChartLine className="text-2xl text-[hsl(207,90%,54%)]" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-feature-compare">Compare Strategies</h3>
              <p className="text-sm lg:text-base text-[hsl(220,8.9%,46.1%)] leading-relaxed">Compare different investment strategies and find the best approach for your goals</p>
            </div>
            
            <div className="bg-white p-6 lg:p-8 rounded-2xl calculator-shadow text-center hover-lift feature-card animate-bounce-in sm:col-span-2 lg:col-span-1" style={{animationDelay: '0.6s'}}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/10 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float" style={{animationDelay: '2s'}}>
                <Target className="text-2xl text-purple-500" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-feature-confidence">Build Confidence</h3>
              <p className="text-sm lg:text-base text-[hsl(220,8.9%,46.1%)] leading-relaxed">Gain financial confidence through educational content and easy-to-understand insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQSection />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(224,71.4%,4.1%)] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] rounded-xl flex items-center justify-center shadow-md">
                  <Zap className="text-white text-lg" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] bg-clip-text text-transparent">SIPGenie</span>
              </div>
              <p className="text-gray-300 mb-4">Your smart investment companion. Calculate SIP returns, compare strategies, and build financial confidence with simple, delightful tools.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Calculators</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">SIP Calculator</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Lumpsum Calculator</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">SWP Calculator</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">PPF Calculator</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Investment</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Mutual Funds</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Stocks</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">ETFs</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">IPO</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[hsl(162,100%,41%)] transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-300">&copy; 2024 SIPGenie. All rights reserved. Built with ❤️ for smart investors.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
