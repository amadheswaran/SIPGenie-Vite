import { useState } from "react";
import { Calculator, TrendingUp, Calendar, ChartLine, Sprout, Zap, Shield, Target, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SIPCalculator from "@/components/sip-calculator";
import FAQSection from "@/components/faq-section";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Calculator' },
    { path: '/compare', label: 'Compare' },
    { path: '/blog', label: 'Blog' }
  ];

  return (
    <div className="bg-[hsl(220,14.3%,97%)]">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                 <a href="/" className="flex items-center space-x-2 pr-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] rounded-xl flex items-center justify-center shadow-md">  
                      <Zap className="text-white text-lg" />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] bg-clip-text text-transparent">
                       SIPGenie
                    </span>
                   </a>
              </div>
              <div className="hidden md:flex space-x-12 absolute left-1/2 transform -translate-x-1/2">
                <a href="/" className="text-lg font-bold text-[hsl(224,71.4%,4.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">
                  Calculator
                </a>
                <a href="/compare/index.html" className="text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">
                  Compare
                </a>
                <a href="/blog/index.html" className="text-lg font-bold text-[hsl(220,8.9%,46.1%)] hover:text-[hsl(162,100%,41%)] transition-all transform hover:scale-105">
                  Blog
                </a>
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
    </div>
  );
}
