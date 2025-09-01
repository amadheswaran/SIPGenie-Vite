import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvestmentChart from "./investment-chart";
import GrowthChart from "./growth-chart";

type CalculatorMode = "sip" | "lumpsum" | "fd";

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
  const [mode, setMode] = useState<CalculatorMode>("sip");
  const [monthlyAmount, setMonthlyAmount] = useState(25000);
  const [returnRate, setReturnRate] = useState(12);
  const [timePeriod, setTimePeriod] = useState(10);
  const [stepUpPercent, setStepUpPercent] = useState(0);

  const [results, setResults] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: [],
  });

  // ---------- Calculations ----------
  const calculateSIP = (
    amount: number,
    rate: number,
    years: number,
    stepUp: number = 0
  ): CalculationResult => {
    // iterative month-by-month FV of SIP with annual step-up
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
        yearlyData.push({
          year,
          invested: Math.round(investedAmount),
          totalValue: Math.round(fv),
        });
        // apply annual step-up after each year
        if (stepUp && stepUp > 0) {
          currentP = +(currentP * (1 + stepUp / 100));
        }
      }
    }

    const estimatedReturns = Math.round(fv - investedAmount);

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns,
      totalValue: Math.round(fv),
      yearlyData,
    };
  };

  const calculateLumpsum = (amount: number, rate: number, years: number): CalculationResult => {
    const futureValue = amount * Math.pow(1 + rate / 100, years);
    const estimatedReturns = futureValue - amount;

    const yearsInt = Math.max(1, Math.floor(years));
    const yearlyData: CalculationResult["yearlyData"] = [];
    for (let year = 1; year <= yearsInt; year++) {
      const v = amount * Math.pow(1 + rate / 100, year);
      yearlyData.push({ year, invested: amount, totalValue: v });
    }

    return {
      investedAmount: amount,
      estimatedReturns,
      totalValue: futureValue,
      yearlyData,
    };
  };

  // FD: quarterly compounding (n=4)
  const calculateFD = (
    amount: number,
    rate: number,
    years: number,
    compounding: number = 4
  ): CalculationResult => {
    const r = rate / 100;
    const n = compounding; // quarterly
    const t = years;

    const futureValue = amount * Math.pow(1 + r / n, n * t);
    const estimatedReturns = futureValue - amount;

    const yearsInt = Math.max(1, Math.floor(years));
    const yearlyData: CalculationResult["yearlyData"] = [];
    for (let year = 1; year <= yearsInt; year++) {
      const v = amount * Math.pow(1 + r / n, n * year);
      yearlyData.push({ year, invested: amount, totalValue: v });
    }

    return {
      investedAmount: amount,
      estimatedReturns,
      totalValue: futureValue,
      yearlyData,
    };
  };

  // ---------- Helpers ----------
  const formatCurrency = (amount: number): string => {
    return "₹" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const updateSliderBackground = (sliderId: string, value: number, min: number, max: number) => {
    const slider = document.getElementById(sliderId) as HTMLInputElement | null;
    if (!slider) return;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.background = `linear-gradient(to right, hsl(162, 100%, 41%) 0%, hsl(162, 100%, 41%) ${percentage}%, hsl(220, 13%, 91%) ${percentage}%, hsl(220, 13%, 91%) 100%)`;
  };

  const amountLabel =
    mode === "sip" ? "Monthly investment" : mode === "lumpsum" ? "Investment amount" : "Principal amount";

  const rateLabel =
    mode === "fd" ? "Fixed deposit interest rate (p.a)" : "Expected return rate (p.a)";

  const modeLabelPretty = mode === "sip" ? "SIP" : mode === "lumpsum" ? "Lumpsum" : "Fixed Deposit (FD)";

  // ---------- PDF Export ----------
  const downloadPDF = async () => {
    // try the dedicated section, fallback to full calculator block
    const element =
      document.getElementById("pdf-export-section") ||
      document.getElementById("calculatorRoot");
    if (!element) return;

    const canvas = await html2canvas(element, {
      useCORS: true,
      scale: 2,
      backgroundColor: "#ffffff",
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Page 1: visual snapshot
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

    // Page 2: clean summary text
    pdf.addPage();
    const margin = 14;
    let y = 20;

    pdf.setFontSize(16);
    pdf.text("SIPGenie — Investment Summary", margin, y);
    y += 10;

    pdf.setFontSize(12);
    pdf.text(`Mode: ${modeLabelPretty}`, margin, y);
    y += 8;

    // Mode-aware lines
    if (mode === "sip") {
      pdf.text(`Monthly Investment: ${formatCurrency(monthlyAmount)}`, margin, y);
      y += 8;
      pdf.text(`Annual Step-up: ${stepUpPercent}%`, margin, y);
      y += 8;
      pdf.text(`Expected Return Rate: ${returnRate}% p.a.`, margin, y);
      y += 8;
    } else if (mode === "lumpsum") {
      pdf.text(`Investment Amount: ${formatCurrency(monthlyAmount)}`, margin, y);
      y += 8;
      pdf.text(`Expected Return Rate: ${returnRate}% p.a.`, margin, y);
      y += 8;
    } else {
      // FD
      pdf.text(`Principal Amount: ${formatCurrency(monthlyAmount)}`, margin, y);
      y += 8;
      pdf.text(`Interest Rate: ${returnRate}% p.a. (Compounded Quarterly)`, margin, y);
      y += 8;
    }

    pdf.text(`Investment Period: ${timePeriod} years`, margin, y);
    y += 12;

    pdf.setFontSize(13);
    pdf.text(`Total Invested: ${formatCurrency(results.investedAmount)}`, margin, y);
    y += 8;
    pdf.text(`Estimated Returns: ${formatCurrency(results.estimatedReturns)}`, margin, y);
    y += 8;
    pdf.text(`Expected Wealth: ${formatCurrency(results.totalValue)}`, margin, y);
    y += 12;

    // Disclaimer
    pdf.setFontSize(10);
    pdf.text(
      "* Investments are subject to market risks. Calculator outputs are estimates—not guarantees.",
      margin,
      y
    );

    pdf.save(`SIPGenie_Report_${modeLabelPretty}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ---------- React Effects ----------
  useEffect(() => {
    let result: CalculationResult;
    if (mode === "sip") {
      result = calculateSIP(monthlyAmount, returnRate, timePeriod, stepUpPercent);
    } else if (mode === "lumpsum") {
      result = calculateLumpsum(monthlyAmount, returnRate, timePeriod);
    } else {
      result = calculateFD(monthlyAmount, returnRate, timePeriod, 4);
    }
    setResults(result);

    // slider backgrounds
    updateSliderBackground("amountSlider", monthlyAmount, 500, 100000);
    updateSliderBackground("returnSlider", returnRate, 1, 30);
    updateSliderBackground("timeSlider", timePeriod, 1, 40);
    if (mode === "sip") {
      updateSliderBackground("stepUpSlider", stepUpPercent, 0, 30);
    }
  }, [monthlyAmount, returnRate, timePeriod, stepUpPercent, mode]);

  // ---------- UI ----------
  return (
    <div id="calculatorRoot" className="grid lg:grid-cols-3 gap-8">
      {/* Wrap the visual region we want in the PDF */}
      <div id="pdf-export-section" className="lg:col-span-3">
        {/* Calculator Input + Results row */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calculator Input Panel */}
          <div className="lg:col-span-2">
            <Card className="calculator-shadow animate-slide-up">
              <CardContent className="p-8">
                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                  <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
                    <Button
                      variant={mode === "sip" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("sip")}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === "sip"
                          ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm"
                          : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
                      }`}
                      data-testid="button-mode-sip"
                    >
                      SIP
                    </Button>

                    <Button
                      variant={mode === "lumpsum" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("lumpsum")}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === "lumpsum"
                          ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm"
                          : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
                      }`}
                      data-testid="button-mode-lumpsum"
                    >
                      Lumpsum
                    </Button>

                    <Button
                      variant={mode === "fd" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setMode("fd")}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                        mode === "fd"
                          ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm"
                          : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
                      }`}
                      data-testid="button-mode-fd"
                    >
                      FD
                    </Button>
                  </div>
                </div>

                {/* FD note */}
                {mode === "fd" && (
                  <div className="mb-6 p-4 rounded-xl bg-[hsl(207,90%,54%)]/5 border border-[hsl(207,90%,54%)]/20 text-[hsl(220,8.9%,46.1%)]">
                    <span className="font-medium text-[hsl(224,71.4%,4.1%)]">
                      Note:
                    </span>{" "}
                    FD returns are calculated with{" "}
                    <strong>quarterly compounding</strong> (n=4), which is the
                    standard for banks in India.
                  </div>
                )}

                <div className="space-y-8">
                  {/* Amount / Monthly / Principal */}
                  <div className="group">
                    <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                      {amountLabel}
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                        ₹
                      </div>
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

                  {/* Rate */}
                  <div className="group">
                    <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                      {rateLabel}
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                        %
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                        {mode === "fd" ? (
                          <>
                            <span>Typical bank range: 5–8%</span>
                            <span>Senior citizens: +0.25–0.75%</span>
                          </>
                        ) : (
                          <>
                            <span>Conservative: 8–10%</span>
                            <span>Aggressive: 12–15%</span>
                          </>
                        )}
                      </div>
                    </div>
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

                  {/* Time period */}
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
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                        Years
                      </div>
                      <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                        <span>Short term: 1–3 years</span>
                        <span>Long term: 10+ years</span>
                      </div>
                    </div>
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

                  {/* Annual Step-up — only for SIP */}
                  {mode === "sip" && (
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
                            <span>0%</span>
                            <span>30%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Summary */}
            <Card className="calculator-shadow animate-slide-up">
              <CardContent className="p-6">
                <h3
                  className="text-lg font-semibold text-[hsl(224,71.4%,4.1%)] mb-6"
                  data-testid="text-investment-summary"
                >
                  Investment Summary
                </h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                    <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Invested amount</span>
                    <span
                      className="font-semibold text-[hsl(224,71.4%,4.1%)]"
                      data-testid="text-invested-amount"
                    >
                      {formatCurrency(results.investedAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[hsl(162,100%,41%)]/5 rounded-xl">
                    <span className="text-sm text-[hsl(220,8.9%,46.1%)]">
                      {mode === "fd" ? "Accrued interest" : "Estimated returns"}
                    </span>
                    <span
                      className="font-semibold text-[hsl(162,100%,41%)]"
                      data-testid="text-estimated-returns"
                    >
                      {formatCurrency(results.estimatedReturns)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-[hsl(207,90%,54%)]/5 rounded-xl border-2 border-[hsl(207,90%,54%)]/20">
                    <span className="text-sm font-medium text-[hsl(224,71.4%,4.1%)]">Total value</span>
                    <span
                      className="text-xl font-bold text-[hsl(207,90%,54%)]"
                      data-testid="text-total-value"
                    >
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

            {/* Pie/Breakdown */}
            <Card className="calculator-shadow animate-slide-up">
              <CardContent className="p-6">
                <h3
                  className="text-lg font-semibold text-[hsl(224,71.4%,4.1%)] mb-4"
                  data-testid="text-investment-breakdown"
                >
                  Investment Breakdown
                </h3>
                <InvestmentChart
                  investedAmount={results.investedAmount}
                  estimatedReturns={results.estimatedReturns}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="lg:col-span-3 mt-6">
          <p
            className="text-base lg:text-lg font-medium text-center"
            style={{ fontStyle: "italic", color: "red" }}
          >
            * Investments are subject to market risks. Calculator results are estimates only
            and not guarantees.
          </p>
        </div>

        {/* Growth Chart Section */}
        <div className="lg:col-span-3 mt-10">
          <div className="text-center mb-12">
            <h2
              className="text-3xl font-bold text-[hsl(224,71.4%,4.1%)] mb-4"
              data-testid="text-growth-title"
            >
              Investment Growth Over Time
            </h2>
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
                      <li>
                        <a href="/ppf.html" className="text-[hsl(162,100%,41%)] hover:underline">
                          PPF Calculator
                        </a>
                      </li>
                      <li>
                        <a href="/goal-calculator.html" className="text-[hsl(162,100%,41%)] hover:underline">
                          Goal Calculator
                        </a>
                      </li>
                      <li>
                        <a href="/sip-vs-lumpsum.html" className="text-[hsl(162,100%,41%)] hover:underline">
                          SIP vs Lumpsum
                        </a>
                      </li>
                    </ul>
                    {mode === "fd" && (
                      <div className="mt-4 text-xs text-[hsl(220,8.9%,46.1%)]">
                        FD figures assume quarterly compounding (n=4). Actual bank practices may vary on
                        payout and reinvestment options.
                      </div>
                    )}
                  </div>
                </aside>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
