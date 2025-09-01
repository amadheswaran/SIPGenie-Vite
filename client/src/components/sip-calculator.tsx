import { useState, useEffect, useMemo } from "react";
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

/** ---------- Helpers ---------- */
const toNumber = (v: string, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const formatCurrency = (amount: number): string =>
  "₹" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const updateSliderBackground = (sliderId: string, value: number, min: number, max: number) => {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  if (!slider) return;
  const pct = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, hsl(162,100%,41%) 0%, hsl(162,100%,41%) ${pct}%, hsl(220,13%,91%) ${pct}%, hsl(220,13%,91%) 100%)`;
};

/** ---------- Calculations ---------- */
const calculateSIP = (
  monthlyAmount: number,
  rate: number,
  years: number,
  stepUpPercent: number = 0
): CalculationResult => {
  const monthlyRate = rate / 100 / 12;
  const months = Math.round(years * 12);
  let currentP = monthlyAmount;
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
      if (stepUpPercent > 0) currentP = +(currentP * (1 + stepUpPercent / 100));
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

  const yearlyData: CalculationResult["yearlyData"] = [];
  for (let year = 1; year <= years; year++) {
    const yearFutureValue = amount * Math.pow(1 + rate / 100, year);
    yearlyData.push({ year, invested: amount, totalValue: yearFutureValue });
  }

  return {
    investedAmount: amount,
    estimatedReturns,
    totalValue: futureValue,
    yearlyData,
  };
};

// FD with quarterly compounding (India standard)
const calculateFD = (principal: number, rate: number, years: number): CalculationResult => {
  const m = 4; // quarterly
  const r = rate / 100;
  const n = years * m;
  const periodRate = r / m;
  const totalValue = principal * Math.pow(1 + periodRate, n);
  const estimatedReturns = totalValue - principal;

  const yearlyData: CalculationResult["yearlyData"] = [];
  for (let year = 1; year <= years; year++) {
    const yPeriods = year * m;
    const yValue = principal * Math.pow(1 + periodRate, yPeriods);
    yearlyData.push({ year, invested: principal, totalValue: yValue });
  }

  return {
    investedAmount: principal,
    estimatedReturns,
    totalValue,
    yearlyData,
  };
};

/** ---------- Goal estimate utility ---------- */
/**
 * Simulate SIP monthly with annual step-up to see when target >= goal.
 * Returns years (integer) or null if not reached within maxYears.
 */
const estimateYearsToGoal = (
  monthly: number,
  rate: number,
  stepUpPercent: number,
  goal: number,
  maxYears = 60
): number | null => {
  if (!monthly || monthly <= 0 || goal <= 0) return null;
  const monthlyRate = rate / 100 / 12;
  let currentP = monthly;
  let fv = 0;
  const maxMonths = maxYears * 12;
  for (let m = 0; m < maxMonths; m++) {
    fv = fv * (1 + monthlyRate) + currentP;
    if ((m + 1) % 12 === 0 && stepUpPercent > 0) {
      currentP = +(currentP * (1 + stepUpPercent / 100));
    }
    if (fv >= goal) {
      return Math.ceil((m + 1) / 12);
    }
  }
  return null;
};

export default function SIPCalculator() {
  /** ---------- UI State (strings to fix backspace=0) ---------- */
  const [mode, setMode] = useState<CalculatorMode>("sip");

  const [amountInput, setAmountInput] = useState<string>("25000"); // monthly (SIP) or principal (FD/Lumpsum)
  const [rateInput, setRateInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [stepInput, setStepInput] = useState<string>("0"); // SIP only

  // Goal states
  const [goalInput, setGoalInput] = useState<string>("10000000"); // default ₹1 Cr
  const [goalYearsResult, setGoalYearsResult] = useState<number | null>(null);

  // Sanitized numeric values used for calculations/graphs
  const amount = useMemo(() => clamp(toNumber(amountInput, 0), 0, 10_000_000), [amountInput]);
  const rate = useMemo(() => clamp(toNumber(rateInput, 0), 0, 30), [rateInput]);
  const years = useMemo(() => clamp(Math.round(toNumber(yearsInput, 0)), 0, 40), [yearsInput]);
  const stepUpPercent = useMemo(() => clamp(toNumber(stepInput, 0), 0, 30), [stepInput]);
  const goalValue = useMemo(() => clamp(toNumber(goalInput, 0), 0, 1_000_000_000), [goalInput]);

  const [results, setResults] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: [],
  });

  /** ---------- Effects ---------- */
  useEffect(() => {
    let res: CalculationResult;
    if (mode === "sip") res = calculateSIP(amount, rate, years, stepUpPercent);
    else if (mode === "fd") res = calculateFD(amount, rate, years);
    else res = calculateLumpsum(amount, rate, years);

    setResults(res);

    // Slider backgrounds
    updateSliderBackground("amountSlider", amount, 500, 100000);
    updateSliderBackground("returnSlider", rate, 1, 30);
    updateSliderBackground("timeSlider", years, 1, 40);
    updateSliderBackground("stepUpSlider", stepUpPercent, 0, 30);
  }, [amount, rate, years, stepUpPercent, mode]);

  // Goal calculation effect (only applicable when mode === 'sip')
  useEffect(() => {
    if (mode !== "sip") {
      setGoalYearsResult(null);
      return;
    }
    if (!goalValue || goalValue <= 0) {
      setGoalYearsResult(null);
      return;
    }
    const yearsNeeded = estimateYearsToGoal(amount, rate, stepUpPercent, goalValue, 60);
    setGoalYearsResult(yearsNeeded);
  }, [goalValue, amount, rate, stepUpPercent, mode]);

  /** ---------- Blur handlers to clamp + pretty format ---------- */
  const onAmountBlur = () => {
    if (amountInput === "") return; // allow blank if user leaves it empty; we'll calculate as 0
    const c = clamp(toNumber(amountInput, 0), 500, 10_000_000);
    setAmountInput(String(Math.round(c)));
  };
  const onRateBlur = () => {
    if (rateInput === "") return;
    const c = clamp(toNumber(rateInput, 0), 1, 30);
    setRateInput(c.toFixed(1));
  };
  const onYearsBlur = () => {
    if (yearsInput === "") return;
    const c = clamp(Math.round(toNumber(yearsInput, 0)), 1, 40);
    setYearsInput(String(c));
  };
  const onStepBlur = () => {
    if (stepInput === "") return;
    const c = clamp(toNumber(stepInput, 0), 0, 30);
    setStepInput(c.toFixed(1));
  };
  const onGoalBlur = () => {
    if (goalInput === "") return;
    const c = clamp(toNumber(goalInput, 0), 0, 1_000_000_000);
    setGoalInput(String(Math.round(c)));
  };

  /** ---------- PDF Export (polished, 2 pages) ---------- */
  const downloadPDF = async () => {
    const container = document.getElementById("pdf-export-section");
    if (!container) {
      alert("Could not find content to export");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Page 1: Header + full content capture
    const headerY = margin + 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("SIPGenie — Investment Report", margin, headerY);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    const modeLabel = mode === "sip" ? "SIP" : mode === "fd" ? "Fixed Deposit (Quarterly)" : "Lumpsum";
    pdf.text(
      `Mode: ${modeLabel} • Date: ${new Date().toLocaleDateString()}`,
      margin,
      headerY + 6
    );

    const canvas = await html2canvas(container, { useCORS: true, scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - margin * 2 - 16; // leave space for header
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;

    const imgX = margin;
    const imgY = headerY + 10;

    pdf.addImage(imgData, "PNG", imgX, imgY, imgW, imgH);

    // Page 2: Key metrics "table"
    pdf.addPage();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("Investment Summary", margin, 20);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    const lines: Array<[string, string]> = [
      ["Mode", modeLabel],
      [mode === "sip" ? "Monthly Investment" : "Investment Amount", formatCurrency(amount)],
      ["Expected Return (p.a.)", `${rate}%`],
      ["Time Horizon", `${years} years`],
      ...(mode === "sip" ? [["Annual Step-up", `${stepUpPercent}%`]] : []),
      ["Total Invested", formatCurrency(results.investedAmount)],
      ["Estimated Returns", formatCurrency(results.estimatedReturns)],
      ["Expected Wealth", formatCurrency(results.totalValue)],
    ];

    // simple table layout
    const col1X = margin;
    const col2X = margin + 70;
    let rowY = 32;

    lines.forEach(([k, v]) => {
      pdf.setFont("helvetica", "bold");
      pdf.text(k, col1X, rowY);
      pdf.setFont("helvetica", "normal");
      pdf.text(v, col2X, rowY);
      rowY += 8;
    });

    // FD note
    if (mode === "fd") {
      rowY += 4;
      pdf.setFontSize(10);
      pdf.text(
        "Note: FD returns are computed with quarterly compounding, a common practice in India.",
        margin,
        rowY
      );
      rowY += 8;
    }

    // Footer & site
    pdf.setFontSize(10);
    pdf.text("Disclaimer: Estimates only. Markets carry risk. Past performance is not indicative of future results.", margin, pageHeight - 18);
    pdf.setFont("helvetica", "bold");
    pdf.text("https://sipgenie.in", margin, pageHeight - 10);

    pdf.save(`SIPGenie_Investment_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div id="calculatorRoot" className="grid lg:grid-cols-3 gap-8">
      {/* Left: Inputs */}
      <div className="lg:col-span-2">
        <Card className="calculator-shadow animate-slide-up">
          <CardContent className="p-8">
            {/* Mode toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 p-1 rounded-xl flex">
                <Button
                  variant={mode === "sip" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMode("sip")}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === "sip" ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm" : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
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
                    mode === "lumpsum" ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm" : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
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
                    mode === "fd" ? "bg-white text-[hsl(224,71.4%,4.1%)] shadow-sm" : "text-gray-600 hover:text-[hsl(224,71.4%,4.1%)]"
                  }`}
                  data-testid="button-mode-fd"
                >
                  FD
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Amount */}
              <div className="group">
                <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  {mode === "sip" ? "Monthly investment" : "Investment amount"}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                    ₹
                  </div>
                  <Input
                    inputMode="numeric"
                    type="text"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value.replace(/[^\d.]/g, ""))}
                    onBlur={onAmountBlur}
                    placeholder="e.g. 25000"
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
                    value={clamp(amount || 0, 500, 100000)}
                    onChange={(e) => setAmountInput(String(parseInt(e.target.value, 10)))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-amount"
                  />
                </div>
              </div>

              {/* Rate */}
              <div className="group">
                <div className="flex items-center justify-between mb-3">
                  <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)]">
                    Expected return rate (p.a)
                  </Label>
                  {mode === "fd" && (
                    <span className="text-xs text-[hsl(220,8.9%,46.1%)]">
                      Compounding: <b>Quarterly</b> (FD standard)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    inputMode="decimal"
                    type="text"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value.replace(/[^\d.]/g, ""))}
                    onBlur={onRateBlur}
                    placeholder="e.g. 12"
                    className="pr-10 pl-4 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-return-rate"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                    %
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-[hsl(220,8.9%,46.1%)]">
                    <span>Conservative: 8–10%</span>
                    <span>Aggressive: 12–15%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    id="returnSlider"
                    min={1}
                    max={30}
                    step={1}
                    value={clamp(rate || 0, 1, 30)}
                    onChange={(e) => setRateInput(String(parseInt(e.target.value, 10)))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-return-rate"
                  />
                </div>
              </div>

              {/* Years */}
              <div className="group">
                <Label className="block text-sm font medium text-[hsl(224,71.4%,4.1%)] mb-3">
                  Time period
                </Label>
                <div className="relative">
                  <Input
                    inputMode="numeric"
                    type="text"
                    value={yearsInput}
                    onChange={(e) => setYearsInput(e.target.value.replace(/[^\d]/g, ""))}
                    onBlur={onYearsBlur}
                    placeholder="e.g. 10"
                    className="pr-16 pl-4 py-4 text-lg font-medium bg-gray-50 focus:bg-white focus:border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                    data-testid="input-time-period"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
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
                    value={clamp(years || 0, 1, 40)}
                    onChange={(e) => setYearsInput(String(parseInt(e.target.value, 10)))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                    data-testid="slider-time-period"
                  />
                </div>
              </div>

              {/* Step-up (SIP only) */}
              {mode === "sip" && (
                <div className="group">
                  <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-3">
                    Annual Step-up (%) — increase your SIP yearly
                  </Label>
                  <div className="relative">
                    <Input
                      inputMode="decimal"
                      type="text"
                      value={stepInput}
                      onChange={(e) => setStepInput(e.target.value.replace(/[^\d.]/g, ""))}
                      onBlur={onStepBlur}
                      placeholder="e.g. 10"
                      className="pr-12 pl-4 py-4 text-lg font-medium border-[hsl(162,100%,41%)] group-hover:border-gray-300 input-focus"
                      data-testid="input-stepup-percent"
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        id="stepUpSlider"
                        min={0}
                        max={30}
                        step={1}
                        value={clamp(stepUpPercent || 0, 0, 30)}
                        onChange={(e) => setStepInput(String(parseInt(e.target.value, 10)))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none slider"
                        data-testid="slider-stepup"
                      />
                      <div className="flex justify-between text-sm text-[hsl(220,8.9%,46.1%)] mt-2">
                        <span>0%</span>
                        <span>30%</span>
                      </div>
                    </div>
                  </div>

                  {/* Investment Goal (SIP only) */}
                  <div className="mt-6">
                    <Label className="block text-sm font-medium text-[hsl(224,71.4%,4.1%)] mb-2">
                      Target wealth goal (estimate years to reach)
                    </Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[hsl(220,8.9%,46.1%)] font-medium">
                        ₹
                      </div>
                      <Input
                        inputMode="numeric"
                        type="text"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value.replace(/[^\d.]/g, ""))}
                        onBlur={onGoalBlur}
                        placeholder="e.g. 10000000"
                        className="pl-8 pr-4 py-3 text-lg bg-gray-50"
                      />
                    </div>
                    <div className="mt-3 text-sm text-[hsl(220,8.9%,46.1%)]">
                      {goalYearsResult ? (
                        <span>
                          ~{goalYearsResult} years to reach {formatCurrency(goalValue)} with current inputs.
                        </span>
                      ) : (
                        <span>Goal not reachable within 60 years with current SIP (or input is empty).</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Results summary + buttons */}
      <div className="space-y-6" id="pdf-export-section">
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
                <span className="text-sm text-[hsl(220,8.9%,46.1%)]">Estimated returns</span>
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

        {/* Investment breakdown (Pie) */}
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

      {/* Disclaimer */}
      <div className="lg:col-span-3">
        <p
          className="text-lg lg:text-xl font-semibold text-[hsl(224,71.4%,4.1%)] mb-4 italic text-center text-red-50"
          style={{ fontStyle: "italic", color: "red" }}
        >
          * Investments are subject to market risks and results from this calculator are estimates
          only and not guarantees; past performance is not indicative of future results.
        </p>
      </div>

      {/* Growth chart + Related calculators */}
      <div className="lg:col-span-3 mt-8" id="growth-chart-section">
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
                      <a href="/ppf" className="text-[hsl(162,100%,41%)] hover:underline">
                        PPF Calculator
                      </a>
                    </li>
                    <li>
                      <a href="/goal-calculator" className="text-[hsl(162,100%,41%)] hover:underline">
                        Goal Calculator
                      </a>
                    </li>
                    <li>
                      <a href="/sip-vs-lumpsum" className="text-[hsl(162,100%,41%)] hover:underline">
                        SIP vs Lumpsum
                      </a>
                    </li>
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
