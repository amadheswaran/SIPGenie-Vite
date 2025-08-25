import { useState } from "react";
import { Calculator, TrendingUp, Calendar, ChartLine, Sprout, Zap, Shield, Target, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SIPCalculator from "@/components/sip-calculator";
import FAQSection from "@/components/faq-section";
import { Link, useLocation } from "wouter";

export default function Footer() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/sip-calculator', label: 'Calculator' },
    { path: '/compare.html', label: 'Compare' },
    { path: '/blog/index.html', label: 'Blog' }
  ];

  return (
    <div className="bg-[hsl(220,14.3%,97%)]">
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
