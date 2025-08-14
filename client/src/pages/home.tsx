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
    // ... rest of your JSX stays unchanged
  );
}
