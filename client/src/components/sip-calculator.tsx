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

/* ---------- Types ---------- */
type CalculatorMode = "sip" | "fd";

interface CalculationResult {
  investedAmount: number;
  estimatedReturns: number;
  totalValue: number;
  yearlyData: Array<{ year: number; invested: number; totalValue: number }>;
}

/* ---------- Helpers ---------- */
const toNumber = (v: string, fallback = 0) => {
  if (v === "") return fallback; // backspace fix
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const formatCurrency = (amount: number): string =>
  "₹" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const updateSliderBackground = (
  sliderId: string,
  value: number,
  min: number,
  max: number
) => {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  if (!slider) return;
  const pct = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, hsl(162,100%,41%) 0%, hsl(162,100%,41%) ${pct}%, hsl(220,13%,91%) ${pct}%, hsl(220,13%,91%) 100%)`;
};

/* ---------- Calculations ---------- */
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
  const yearlyData: CalculationResult["yearlyData"] = [];

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

const calculateFD = (
  principal: number,
  rate: number,
  years: number
): CalculationResult => {
  const m = 4; // quarterly compounding
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

/* ---------- Component ---------- */
export default function SIPCalculator() {
  const [mode, setMode] = useState<CalculatorMode>("sip");
  const [compare, setCompare] = useState<boolean>(false);

  const [amountInput, setAmountInput] = useState<string>("25000");
  const [rateInput, setRateInput] = useState<string>("12");
  const [yearsInput, setYearsInput] = useState<string>("10");
  const [stepInput, setStepInput] = useState<string>("0");

  const amount = useMemo(
    () => clamp(toNumber(amountInput, 0), 0, 10_000_000),
    [amountInput]
  );
  const rate = useMemo(
    () => clamp(toNumber(rateInput, 0), 0, 30),
    [rateInput]
  );
  const years = useMemo(
    () => clamp(Math.round(toNumber(yearsInput, 0)), 0, 40),
    [yearsInput]
  );
  const stepUpPercent = useMemo(
    () => clamp(toNumber(stepInput, 0), 0, 30),
    [stepInput]
  );

  const [results, setResults] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: [],
  });

  const [compareResults, setCompareResults] = useState<{
    sip: CalculationResult;
    fd: CalculationResult;
  } | null>(null);

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (compare) {
      const sipRes = calculateSIP(amount, rate, years, stepUpPercent);
      const fdRes = calculateFD(amount, rate, years);
      setCompareResults({ sip: sipRes, fd: fdRes });
    } else {
      let res: CalculationResult;
      if (mode === "sip")
        res = calculateSIP(amount, rate, years, stepUpPercent);
      else res = calculateFD(amount, rate, years);
      setResults(res);
    }

    updateSliderBackground("amountSlider", amount, 500, 100000);
    updateSliderBackground("returnSlider", rate, 1, 30);
    updateSliderBackground("timeSlider", years, 1, 40);
    updateSliderBackground("stepUpSlider", stepUpPercent, 0, 30);
  }, [amount, rate, years, stepUpPercent, mode, compare]);

  /* ---------- PDF Export ---------- */
  const downloadPDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 10;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("SIPGenie — Investment Report", margin, 20);

    if (compare && compareResults) {
      pdf.setFontSize(12);
      pdf.text("Comparison Mode (SIP vs FD)", margin, 30);

      const lines: Array<[string, string, string]> = [
        ["Metric", "SIP", "FD"],
        ["Invested", formatCurrency(compareResults.sip.investedAmount), formatCurrency(compareResults.fd.investedAmount)],
        ["Returns", formatCurrency(compareResults.sip.estimatedReturns), formatCurrency(compareResults.fd.estimatedReturns)],
        ["Total", formatCurrency(compareResults.sip.totalValue), formatCurrency(compareResults.fd.totalValue)],
      ];

      let y = 40;
      lines.forEach(([m, s, f]) => {
        pdf.text(m, margin, y);
        pdf.text(s, margin + 60, y);
        pdf.text(f, margin + 110, y);
        y += 8;
      });
    } else {
      pdf.setFontSize(12);
      pdf.text(`Mode: ${mode.toUpperCase()}`, margin, 30);
      pdf.text(
        `Invested: ${formatCurrency(results.investedAmount)}`,
        margin,
        40
      );
      pdf.text(
        `Returns: ${formatCurrency(results.estimatedReturns)}`,
        margin,
        48
      );
      pdf.text(`Total: ${formatCurrency(results.totalValue)}`, margin, 56);
    }

    pdf.save(`SIPGenie_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  /* ---------- Render ---------- */
  return (
    <div id="calculatorRoot" className="grid lg:grid-cols-3 gap-8">
      {/* Left: Inputs */}
      <div className="lg:col-span-2">
        <Card className="calculator-shadow animate-slide-up">
          <CardContent className="p-8">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                <Button
                  variant={mode === "sip" ? "default" : "ghost"}
                  onClick={() => setMode("sip")}
                >
                  SIP
                </Button>
                <Button
                  variant={mode === "fd" ? "default" : "ghost"}
                  onClick={() => setMode("fd")}
                >
                  FD
                </Button>
              </div>
              <Button
                variant={compare ? "default" : "outline"}
                onClick={() => setCompare((c) => !c)}
              >
                {compare ? "Exit Compare" : "Compare SIP vs FD"}
              </Button>
            </div>

            <div className="space-y-8">
              {/* Investment Amount */}
              <div className="group">
                <Label className="block text-sm font-medium mb-3">
                  {mode === "sip" ? "Monthly Investment" : "Investment Amount"}
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">₹</div>
                  <Input
                    type="number"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    placeholder="Enter amount"
                    className="pl-8"
                  />
                </div>
                <input
                  type="range"
                  id="amountSlider"
                  min={500}
                  max={100000}
                  value={amount}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full mt-2"
                />
              </div>

              {/* Return Rate */}
              <div className="group">
                <Label className="block text-sm font-medium mb-3">
                  Expected return rate (p.a)
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(e.target.value)}
                    placeholder="Enter %"
                    className="pr-8"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">%</div>
                </div>
                <input
                  type="range"
                  id="returnSlider"
                  min={1}
                  max={30}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full mt-2"
                />
              </div>

              {/* Time Period */}
              <div className="group">
                <Label className="block text-sm font-medium mb-3">
                  Time period
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={yearsInput}
                    onChange={(e) => setYearsInput(e.target.value)}
                    placeholder="Years"
                    className="pr-12"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    Years
                  </div>
                </div>
                <input
                  type="range"
                  id="timeSlider"
                  min={1}
                  max={40}
                  value={years}
                  onChange={(e) => setYearsInput(e.target.value)}
                  className="w-full mt-2"
                />
              </div>

              {/* Step-Up SIP */}
              {mode === "sip" && (
                <div className="group">
                  <Label className="block text-sm font-medium mb-3">
                    Annual Step-up (%)
                  </Label>
                  <Input
                    type="number"
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                  />
                  <input
                    type="range"
                    id="stepUpSlider"
                    min={0}
                    max={30}
                    step={0.1}
                    value={stepUpPercent}
                    onChange={(e) => setStepInput(e.target.value)}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Results */}
      <div className="space-y-6">
        {!compare && (
          <Card className="calculator-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Summary</h3>
              <p>Invested: {formatCurrency(results.investedAmount)}</p>
              <p>Returns: {formatCurrency(results.estimatedReturns)}</p>
              <p>Total: {formatCurrency(results.totalValue)}</p>
              <Button className="mt-4" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </CardContent>
          </Card>
        )}

        {compare && compareResults && (
          <Card className="calculator-shadow">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">SIP vs FD</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded">
                  <h4 className="font-bold">SIP</h4>
                  <p>{formatCurrency(compareResults.sip.investedAmount)}</p>
                  <p>{formatCurrency(compareResults.sip.estimatedReturns)}</p>
                  <p>{formatCurrency(compareResults.sip.totalValue)}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <h4 className="font-bold">FD</h4>
                  <p>{formatCurrency(compareResults.fd.investedAmount)}</p>
                  <p>{formatCurrency(compareResults.fd.estimatedReturns)}</p>
                  <p>{formatCurrency(compareResults.fd.totalValue)}</p>
                </div>
              </div>
              <Button className="mt-4" onClick={downloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Download Comparison PDF
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="calculator-shadow">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Growth Chart</h3>
            <GrowthChart
              data={
                compare && compareResults
                  ? [
                      { name: "SIP", data: compareResults.sip.yearlyData },
                      { name: "FD", data: compareResults.fd.yearlyData },
                    ]
                  : [{ name: mode.toUpperCase(), data: results.yearlyData }]
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
