import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Rocket, Download } from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import InvestmentChart from "./investment-chart";
import GrowthChart from "./growth-chart";

type CalculatorMode = 'sip' | 'lumpsum';

interface CalculationResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: Array<{
    year: number;
    invested: number;
    totalValue: number;
  }>;
}

export default function SIPCalculator() {
  const [mode, setMode] = useState<CalculatorMode>('sip');
  const [monthlyAmount, setMonthlyAmount] = useState(25000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [stepUpPercent, setStepUpPercent] = useState(0);
  const [results, setResults] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: []
  });

  
const calculateSIP = (amount: number, rate: number, years: number, stepUpPercent: number = 0): CalculationResult => {
  // Month-by-month iterative SIP calculation supporting annual step-up in contribution
  const monthlyRate = rate / 100 / 12;
  const months = Math.round(years * 12);
  let currentP = amount;
  let fv = 0;
  let investedAmount = 0;
  const yearlyData: Array<{ year: number; invested: number; totalValue: number }> = [];

  for (let m = 0; m < months; m++) {
    fv = fv * (1 + monthlyRate) + currentP;
    investedAmount += currentP;
    if ((m + 1) % 12 === 0) {
      const year = Math.round((m + 1) / 12);
      yearlyData.push({ year, invested: Math.round(investedAmount), totalValue: Math.round(fv) });
      // apply annual step-up after the year's contribution
      if (stepUpPercent && stepUpPercent > 0) {
        currentP = +(currentP * (1 + stepUpPercent / 100));
      }
    }
  }

  const estimatedReturns = Math.round(fv - investedAmount);

  return {
    investedAmount: Math.round(investedAmount),
    estimatedReturns,
    totalValue: Math.round(fv),
    yearlyData
  };
};
const calculateLumpsum = (amount: number, rate: number, years: number): CalculationResult => {
    const futureValue = amount * Math.pow(1 + rate / 100, years);
    const estimatedReturns = futureValue - amount;

    // Calculate yearly data
    const yearlyData = [];
    for (let year = 1; year <= years; year++) {
      const yearFutureValue = amount * Math.pow(1 + rate / 100, year);
      yearlyData.push({
        year,
        invested: amount,
        totalValue: yearFutureValue
      });
    }
    
    return {
      investedAmount: amount,
      estimatedReturns,
      totalValue: futureValue,
      yearlyData
    };
  };

  const formatCurrency = (amount: number): string => {
    return '₹' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  
const downloadPDF = async () => {
    try {
      const container = document.getElementById('calculatorRoot');
      if (!container) {
        alert('Could not find content to export');
        return;
      }
      const canvas = await html2canvas(container, { useCORS: true, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * usableWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', margin, 10, usableWidth, pdfHeight);
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('SIPGenie — Investment Summary', margin, 25);
      pdf.setFontSize(11);
      pdf.text(`Monthly Investment: ${formatCurrency(monthlyAmount)}`, margin, 40);
      pdf.text(`Expected Return Rate: ${returnRate}% p.a.`, margin, 48);
      pdf.text(`Investment Period: ${timePeriod} years`, margin, 56);
      pdf.text(`Annual Step-up: ${stepUpPercent}%`, margin, 64);
      pdf.text(`Total Invested: ${formatCurrency(results.investedAmount)}`, margin, 80);
      pdf.text(`Expected Wealth: ${formatCurrency(results.totalValue)}`, margin, 88);
      pdf.text(`Estimated Returns: ${formatCurrency(results.estimatedReturns)}`, margin, 96);
      pdf.save(`SIPGenie_Investment_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      alert('PDF generation failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const updateSliderBackground = (sliderId: string, value: number, min: number, max: number) => {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    if (slider) {
      const percentage = ((value - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, hsl(162, 100%, 41%) 0%, hsl(162, 100%, 41%) ${percentage}%, hsl(220, 13%, 91%) ${percentage}%, hsl(220, 13%, 91%) 100%)`;
    }
  };

  useEffect(() => {
    const result = mode === 'sip' 
      ? calculateSIP(monthlyAmount, returnRate, timePeriod, stepUpPercent)
      : calculateLumpsum(monthlyAmount, returnRate, timePeriod);
    setResults(result);

    // Update slider backgrounds
    updateSliderBackground('amountSlider', monthlyAmount, 500, 100000);
    updateSliderBackground('returnSlider', returnRate, 1, 30);
    updateSliderBackground('timeSlider', timePeriod, 1, 40);
    updateSliderBackground('stepUpSlider', stepUpPercent, 0, 30);
  }, [monthlyAmount, returnRate, timePeriod, stepUpPercent, mode]);

  return (
    <div id="calculatorRoot" className="grid lg:grid-cols-3 gap-8">
      {/* Calculator Input Panel */}
      <div className="lg:col-span-2">
        <Card className="calculator-shadow animate-slide-up">
          <CardContent className="p-8">
            {/* Calculator Mode Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <Button
                  variant={mode === 'sip' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('sip')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'sip' 
                      ? 'bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm' 
                      : 'text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]'
                  }`}
                  data-testid="button-mode-sip"
                >
                  SIP
                </Button>
                <Button
                  variant={mode === 'lumpsum' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMode('lumpsum')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === 'lumpsum' 
                      ? 'bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm' 
                      : 'text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]'
                  }`}
                  data-testid="button-mode-lumpsum"
                >
                  Lumpsum
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Monthly Investment / Lumpsum Amount */}
              <div className="group">
                <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  {mode === 'sip' ? 'Monthly investment' : 'Investment amount'}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">₹</div>
                  <Input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    min={500}
                    max={10000000}
                    className="pl-8 pr-4 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-monthly-amount"
                  />
                  <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                    <span>Min: ₹500</span>
                    <span>Max: ₹1 Cr</span>
                  </div>
                </div>
                {/* Amount Range Slider */}
                <div className="mt-4">
                  <input
                    type="range"
                    id="amountSlider"
                    min={500}
                    max={100000}
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-amount"
                  />
                </div>
              </div>

              {/* Expected Return Rate */}
              <div className="group">
                <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  Expected return rate (p.a)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={returnRate}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    min={1}
                    max={30}
                    step={0.1}
                    className="pr-8 pl-4 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-return-rate"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">%</div>
                  <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                    <span>Conservative: 8-10%</span>
                    <span>Aggressive: 12-15%</span>
                  </div>
                </div>
                {/* Return Rate Slider */}
                <div className="mt-4">
                  <input
                    type="range"
                    id="returnSlider"
                    min={1}
                    max={30}
                    value={returnRate}
                    step={0.5}
                    onChange={(e) => setReturnRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-return-rate"
                  />
                </div>
              </div>

              {/* Time Period */}
              <div className="group">
                <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  Time period
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    min={1}
                    max={40}
                    className="pr-12 pl-4 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-time-period"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">Years</div>
                  <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                    <span>Short term: 1-3 years</span>
                    <span>Long term: 10+ years</span>
                  </div>
                </div>
                {/* Time Period Slider */}
                <div className="mt-4">
                  <input
                    type="range"
                    id="timeSlider"
                    min={1}
                    max={40}
                    value={timePeriod}
                    onChange={(e) => setTimePeriod(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-time-period"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


              {/* Annual Step-up Percentage */}
              <div className="group">
                <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  Annual Step-up (%) — increase your SIP yearly
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={stepUpPercent}
                    onChange={(e) => setStepUpPercent(Number(e.target.value))}
                    min={0}
                    max={30}
                    step={0.1}
                    className="pr-12 pl-4 py-4 text-lg font-medium border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-stepup-percent"
                  />
                  <div className="mt-2">
                    <input
                      type="range"
                      id="stepUpSlider"
                      min={0}
                      max={30}
                      step={0.1}
                      value={stepUpPercent}
                      onChange={(e) => setStepUpPercent(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                      data-testid="slider-stepup"
                    />
                    <div className="flex justify-between text-sm text-[hsl(220,8.9%,46.1%)] mt-2">
                      <span>0%</span><span>30%</span>
                    </div>
                  </div>
                </div>
              </div>

      {/* Results Panel */}
      <div className="space-y-6">
        {/* Results Summary */}
        <Card className="calculator-shadow animate-slide-up">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[hsl(224,71.4%,4.1%)] mb-6" data-testid="text-investment-summary">Investment Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Invested amount</span>
                <span className="font-semibold text-[hsl(224,71.4%,4.1%)]" data-testid="text-invested-amount">
                  {formatCurrency(results.investedAmount)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-[hsl(162,100%,41%)]/5 rounded-xl">
                <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Est. returns</span>
                <span className="font-semibold text-[hsl(162,100%,41%)]" data-testid="text-estimated-returns">
                  {formatCurrency(results.estimatedReturns)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-[hsl(207,90%,54%)]/5 rounded-xl border-2 border-[hsl(207,90%,54%)]/20">
                <span className="text-sm font-medium text-[hsl(224,71.4%,4.1%)]">Total value</span>
                <span className="text-xl font-bold text-[hsl(207,90%,54%)]" data-testid="text-total-value">
                  {formatCurrency(results.totalValue)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mt-6">
              <Button 
                variant="outline"
                className="bg-gradient-to-r from-[hsl(162,100%,41%)] to-[hsl(207,90%,54%)] text-white py-4 rounded-xl font-semibold text-lg hover:shadow-xl transition-all transform hover:scale-105"
                onClick={downloadPDF}
                data-testid="button-download-pdf"
              >
                <Download className="mr-2 h-4 w-4" />
                DOWNLOAD PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chart Container */}
        <Card className="calculator-shadow animate-slide-up">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-investment-breakdown">Investment Breakdown</h3>
            <InvestmentChart 
              investedAmount={results.investedAmount}
              estimatedReturns={results.estimatedReturns}
            />
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart Section */}
      <div className="lg:col-span-3 mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4" data-testid="text-growth-title">Investment Growth Over Time</h2>
          <p className="text-[hsl(220,8.9%,46.1%)]">See how your investment grows year by year</p>
        </div>
        <Card className="bg-[hsl(220,14.3%,97%)] calculator-shadow">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <GrowthChart data={results.yearlyData} />
              </div>
              <aside className="md:col-span-1">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="text-lg font-semibold mb-3">Related Calculators</h4>
                  <ul className="space-y-2 text-[hsl(220,8.9%,46.1%)]">
                    <li><a href="/ppf" className="text-[hsl(162,100%,41%)] hover:underline">PPF Calculator</a></li>
                    <li><a href="/goal-calculator" className="text-[hsl(162,100%,41%)] hover:underline">Goal Calculator</a></li>
                    <li><a href="/sip-vs-lumpsum" className="text-[hsl(162,100%,41%)] hover:underline">SIP vs Lumpsum</a></li>
                  </ul>
                </div>
              </aside>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
