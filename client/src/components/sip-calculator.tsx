import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText } from "lucide-react";
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

/* ----------------- Helpers ----------------- */
const toNumber = (v: string, fallback = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const formatCurrency = (amount: number) =>
  "₹" + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const updateSliderBackground = (sliderId: string, value: number, min: number, max: number) => {
  const slider = document.getElementById(sliderId) as HTMLInputElement | null;
  if (!slider) return;
  const pct = ((value - min) / (max - min)) * 100;
  slider.style.background = `linear-gradient(to right, hsl(162,100%,41%) 0%, hsl(162,100%,41%) ${pct}%, hsl(220,13%,91%) ${pct}%, hsl(220,13%,91%) 100%)`;
};

/* ----------------- Calculators ----------------- */
// SIP: month by month with annual step-up
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
      yearlyData.push({ year, invested: Math.round(investedAmount), totalValue: Math.round(fv) });
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

// Lumpsum: compound annually
const calculateLumpsum = (amount: number, rate: number, years: number): CalculationResult => {
  const futureValue = amount * Math.pow(1 + rate / 100, years);
  const estimatedReturns = futureValue - amount;
  const yearlyData: CalculationResult["yearlyData"] = [];
  for (let year = 1; year <= years; year++) {
    yearlyData.push({ year, invested: amount, totalValue: amount * Math.pow(1 + rate / 100, year) });
  }
  return {
    investedAmount: amount,
    estimatedReturns,
    totalValue: futureValue,
    yearlyData,
  };
};

// FD: quarterly compounding (n=4)
const calculateFD = (principal: number, rate: number, years: number): CalculationResult => {
  const m = 4; // quarterly
  const r = rate / 100;
  const nPeriods = years * m;
  const periodRate = r / m;
  const totalValue = principal * Math.pow(1 + periodRate, nPeriods);
  const estimatedReturns = totalValue - principal;

  const yearlyData: CalculationResult["yearlyData"] = [];
  for (let y = 1; y <= years; y++) {
    const yPeriods = y * m;
    const yValue = principal * Math.pow(1 + periodRate, yPeriods);
    yearlyData.push({ year: y, invested: principal, totalValue: yValue });
  }
  return {
    investedAmount: principal,
    estimatedReturns,
    totalValue,
    yearlyData,
  };
};

/* ----------------- Component ----------------- */
export default function SIPCalculator() {
  /* ---------- Primary scenario (A) state — strings to preserve backspace behavior ---------- */
  const [modeA, setModeA] = useState<CalculatorMode>("sip");
  const [amountA, setAmountA] = useState<string>("25000");
  const [rateA, setRateA] = useState<string>("12");
  const [yearsA, setYearsA] = useState<string>("10");
  const [stepA, setStepA] = useState<string>("0");

  /* ---------- Secondary scenario (B) for comparison ---------- */
  const [compareOpen, setCompareOpen] = useState<boolean>(false);
  const [modeB, setModeB] = useState<CalculatorMode>("lumpsum");
  const [amountB, setAmountB] = useState<string>("100000");
  const [rateB, setRateB] = useState<string>("7");
  const [yearsB, setYearsB] = useState<string>("10");
  const [stepB, setStepB] = useState<string>("0");

  /* ---------- Sanitized numeric values (memoized) ---------- */
  const amtA = useMemo(() => clamp(toNumber(amountA, 0), 0, 10_000_000), [amountA]);
  const rA = useMemo(() => clamp(toNumber(rateA, 0), 0, 30), [rateA]);
  const yrsA = useMemo(() => clamp(Math.round(toNumber(yearsA, 0)), 0, 40), [yearsA]);
  const stpA = useMemo(() => clamp(toNumber(stepA, 0), 0, 30), [stepA]);

  const amtB = useMemo(() => clamp(toNumber(amountB, 0), 0, 10_000_000), [amountB]);
  const rB = useMemo(() => clamp(toNumber(rateB, 0), 0, 30), [rateB]);
  const yrsB = useMemo(() => clamp(Math.round(toNumber(yearsB, 0)), 0, 40), [yearsB]);
  const stpB = useMemo(() => clamp(toNumber(stepB, 0), 0, 30), [stepB]);

  /* ---------- Results state ---------- */
  const [resultsA, setResultsA] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: [],
  });
  const [resultsB, setResultsB] = useState<CalculationResult>({
    investedAmount: 0,
    estimatedReturns: 0,
    totalValue: 0,
    yearlyData: [],
  });

  /* ---------- Effects to recalc A & B ---------- */
  useEffect(() => {
    let r: CalculationResult;
    if (modeA === "sip") r = calculateSIP(amtA, rA, yrsA, stpA);
    else if (modeA === "fd") r = calculateFD(amtA, rA, yrsA);
    else r = calculateLumpsum(amtA, rA, yrsA);
    setResultsA(r);

    // sliders A
    updateSliderBackground("amountSliderA", amtA || 0, 500, 100000);
    updateSliderBackground("returnSliderA", rA || 0, 1, 30);
    updateSliderBackground("timeSliderA", yrsA || 0, 1, 40);
    updateSliderBackground("stepUpSliderA", stpA || 0, 0, 30);
  }, [amtA, rA, yrsA, stpA, modeA]);

  useEffect(() => {
    if (!compareOpen) return;
    let r: CalculationResult;
    if (modeB === "sip") r = calculateSIP(amtB, rB, yrsB, stpB);
    else if (modeB === "fd") r = calculateFD(amtB, rB, yrsB);
    else r = calculateLumpsum(amtB, rB, yrsB);
    setResultsB(r);

    // sliders B
    updateSliderBackground("amountSliderB", amtB || 0, 500, 100000);
    updateSliderBackground("returnSliderB", rB || 0, 1, 30);
    updateSliderBackground("timeSliderB", yrsB || 0, 1, 40);
    updateSliderBackground("stepUpSliderB", stpB || 0, 0, 30);
  }, [amtB, rB, yrsB, stpB, modeB, compareOpen]);

  /* ---------- Blur handlers to prettify and clamp (A) ---------- */
  const onAmountABlur = () => {
    if (amountA.trim() === "") return;
    const cl = clamp(Math.round(toNumber(amountA, 0)), 500, 10_000_000);
    setAmountA(String(cl));
  };
  const onRateABlur = () => {
    if (rateA.trim() === "") return;
    const cl = clamp(toNumber(rateA, 0), 1, 30);
    setRateA(cl.toFixed(1));
  };
  const onYearsABlur = () => {
    if (yearsA.trim() === "") return;
    const cl = clamp(Math.round(toNumber(yearsA, 0)), 1, 40);
    setYearsA(String(cl));
  };
  const onStepABlur = () => {
    if (stepA.trim() === "") return;
    const cl = clamp(toNumber(stepA, 0), 0, 30);
    setStepA(cl.toFixed(1));
  };

  /* ---------- Blur handlers for B ---------- */
  const onAmountBBlur = () => {
    if (amountB.trim() === "") return;
    const cl = clamp(Math.round(toNumber(amountB, 0)), 500, 10_000_000);
    setAmountB(String(cl));
  };
  const onRateBBlur = () => {
    if (rateB.trim() === "") return;
    const cl = clamp(toNumber(rateB, 0), 1, 30);
    setRateB(cl.toFixed(1));
  };
  const onYearsBBlur = () => {
    if (yearsB.trim() === "") return;
    const cl = clamp(Math.round(toNumber(yearsB, 0)), 1, 40);
    setYearsB(String(cl));
  };
  const onStepBBlur = () => {
    if (stepB.trim() === "") return;
    const cl = clamp(toNumber(stepB, 0), 0, 30);
    setStepB(cl.toFixed(1));
  };

  /* ---------- Investment Goal Calculator (SIP only) ----------
     Estimate how many years required (simulation) to reach target wealth given monthly SIP, rate, step-up
  */
  const estimateYearsToGoal = (monthly: number, rate: number, stepUp: number, goal: number, maxYears = 60) => {
    if (!monthly || monthly <= 0 || goal <= 0) return null;
    let currentP = monthly;
    let fv = 0;
    const monthlyRate = rate / 100 / 12;
    const maxMonths = maxYears * 12;
    for (let m = 0; m < maxMonths; m++) {
      fv = fv * (1 + monthlyRate) + currentP;
      if ((m + 1) % 12 === 0 && stepUp > 0) currentP = +(currentP * (1 + stepUp / 100));
      if (fv >= goal) {
        const years = Math.ceil((m + 1) / 12);
        return years;
      }
    }
    return null;
  };

  const [goalInput, setGoalInput] = useState<string>("10000000"); // ₹1 Cr default
  const [goalYearsResult, setGoalYearsResult] = useState<number | null>(null);

  useEffect(() => {
    // run only for SIP scenario A (we'll support SIP mode)
    if (modeA !== "sip") {
      setGoalYearsResult(null);
      return;
    }
    const goalVal = toNumber(goalInput, 0);
    const yearsNeeded = estimateYearsToGoal(amtA, rA, stpA, goalVal, 60);
    setGoalYearsResult(yearsNeeded);
  }, [goalInput, amtA, rA, stpA, modeA]);

  /* ---------- CSV Export ---------- */
  const downloadCSV = (which: "A" | "B" | "both" = "A") => {
    const toCSVRows = (data: CalculationResult["yearlyData"], label = "Scenario") => {
      const rows = [["Year", `${label} Invested`, `${label} TotalValue`]];
      data.forEach((d) => rows.push([String(d.year), String(d.invested), String(Math.round(d.totalValue))]));
      return rows.map((r) => r.join(",")).join("\n");
    };

    let csv = "";
    if (which === "A") csv = toCSVRows(resultsA.yearlyData, "A");
    else if (which === "B") csv = toCSVRows(resultsB.yearlyData, "B");
    else {
      // merge A and B by year (max length)
      const maxLen = Math.max(resultsA.yearlyData.length, resultsB.yearlyData.length);
      const lines = [["Year", "A Invested", "A TotalValue", "B Invested", "B TotalValue"]];
      for (let i = 0; i < maxLen; i++) {
        const a = resultsA.yearlyData[i];
        const b = resultsB.yearlyData[i];
        lines.push([
          String(i + 1),
          a ? String(a.invested) : "",
          a ? String(Math.round(a.totalValue)) : "",
          b ? String(b.invested) : "",
          b ? String(Math.round(b.totalValue)) : "",
        ]);
      }
      csv = lines.map((r) => r.join(",")).join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = which === "A" ? "sipgenie_A.csv" : which === "B" ? "sipgenie_B.csv" : "sipgenie_compare.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------- Share Buttons ---------- */
  const shareTextFor = (which: "A" | "B") => {
    const res = which === "A" ? resultsA : resultsB;
    const mode = which === "A" ? modeA : modeB;
    const labelMode = mode === "sip" ? "SIP" : mode === "fd" ? "FD" : "Lumpsum";
    const amount = which === "A" ? amtA : amtB;
    const yrs = which === "A" ? yrsA : yrsB;
    const rt = which === "A" ? rA : rB;
    return `My ${labelMode} of ${formatCurrency(amount)} for ${yrs} yrs at ${rt}% could become ${formatCurrency(res.totalValue)} 🚀. Try the SIPGenie calculator: https://sipgenie.in`;
  };

  const shareTwitter = (which: "A" | "B" | "both" = "A") => {
    const text = which === "both" ? `${shareTextFor("A")} \n\nVS\n\n ${shareTextFor("B")}` : shareTextFor(which as "A" | "B");
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  };
  const shareWhatsApp = (which: "A" | "B" | "both" = "A") => {
    const text = which === "both" ? `${shareTextFor("A")} \n\nVS\n\n ${shareTextFor("B")}` : shareTextFor(which as "A" | "B");
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  /* ---------- PDF Export (polished) ----------
     Will include both scenarios if compareOpen===true
  */
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

    // Top header
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text("SIPGenie — Investment Report", margin, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, 24);
    pdf.text("https://sipgenie.in", pageWidth - margin - 50, 24);

    // screenshot the visual part (cards + charts)
    const canvas = await html2canvas(container, { useCORS: true, scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");

    const maxW = pageWidth - margin * 2;
    const maxH = pageHeight - 40;
    const ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
    const imgW = canvas.width * ratio;
    const imgH = canvas.height * ratio;

    pdf.addImage(imgData, "PNG", margin, 28, imgW, imgH);

    // Page 2: Summary tables for A and optionally B
    pdf.addPage();
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text("Summary", margin, 18);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    // Helper to render a scenario block
    const renderScenarioSummary = (startY: number, title: string, mode: CalculatorMode, amt: number, rt: number, yrs: number, stp: number, res: CalculationResult) => {
      let y = startY;
      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin, y);
      y += 6;
      pdf.setFont("helvetica", "normal");
      pdf.text(`Mode: ${mode === "sip" ? "SIP" : mode === "fd" ? "Fixed Deposit (Quarterly)" : "Lumpsum"}`, margin, y);
      y += 6;
      pdf.text(`${mode === "sip" ? "Monthly Investment" : "Investment Amount"}: ${formatCurrency(amt)}`, margin, y);
      y += 6;
      pdf.text(`Expected Rate (p.a.): ${rt}%`, margin, y);
      y += 6;
      pdf.text(`Tenure: ${yrs} years`, margin, y);
      y += 6;
      if (mode === "sip") {
        pdf.text(`Annual Step-up: ${stp}%`, margin, y);
        y += 6;
      }
      pdf.text(`Total Invested: ${formatCurrency(res.investedAmount)}`, margin, y);
      y += 6;
      pdf.text(`Estimated Returns: ${formatCurrency(res.estimatedReturns)}`, margin, y);
      y += 6;
      pdf.text(`Expected Wealth: ${formatCurrency(res.totalValue)}`, margin, y);
      return y;
    };

    let curY = 26;
    curY = renderScenarioSummary(curY, "Scenario A", modeA, amtA, rA, yrsA, stpA, resultsA) + 8;

    if (compareOpen) {
      curY = renderScenarioSummary(curY, "Scenario B", modeB, amtB, rB, yrsB, stpB, resultsB) + 8;
    }

    // Footer
    pdf.setFontSize(9);
    pdf.text("Disclaimer: Calculations are estimates only and not investment advice.", margin, pageHeight - 16);
    pdf.save(`SIPGenie_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  /* ---------- Utility: copy A -> B ---------- */
  const copyAToB = () => {
    setModeB(modeA);
    setAmountB(amountA);
    setRateB(rateA);
    setYearsB(yearsA);
    setStepB(stepA);
  };

  /* ---------- Pre-filled examples (A) ---------- */
  const presets = [
    { label: "₹5k / 15 yrs", amount: "5000", rate: "12", years: "15", step: "8", mode: "sip" as CalculatorMode },
    { label: "₹10k / 20 yrs", amount: "10000", rate: "12", years: "20", step: "10", mode: "sip" as CalculatorMode },
    { label: "₹25k / 10 yrs", amount: "25000", rate: "12", years: "10", step: "5", mode: "sip" as CalculatorMode },
    { label: "FD ₹1L / 5 yrs", amount: "100000", rate: "7", years: "5", step: "0", mode: "fd" as CalculatorMode },
  ];

  /* ---------- Render UI ---------- */
  return (
    <div id="calculatorRoot" className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Primary Inputs (A) plus presets */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-xl">SIPGenie — Calculator</div>
                <div className="flex items-center space-x-3">
                  <button
                    className={`px-3 py-1 rounded ${compareOpen ? "bg-gray-200" : "bg-white"} border`}
                    onClick={() => setCompareOpen(!compareOpen)}
                    title="Compare scenarios"
                  >
                    {compareOpen ? "Comparing: ON" : "Compare scenarios"}
                  </button>
                  <Button variant="ghost" onClick={() => { /* no-op placeholder */ }}><FileText /></Button>
                </div>
              </div>

              {/* Mode toggle A */}
              <div className="mb-4">
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                  <button
                    className={`px-4 py-2 rounded ${modeA === "sip" ? "bg-white shadow" : ""}`}
                    onClick={() => setModeA("sip")}
                  >
                    SIP
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${modeA === "lumpsum" ? "bg-white shadow" : ""}`}
                    onClick={() => setModeA("lumpsum")}
                  >
                    Lumpsum
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${modeA === "fd" ? "bg-white shadow" : ""}`}
                    onClick={() => setModeA("fd")}
                  >
                    FD
                  </button>
                </div>
              </div>

              {/* Inputs grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left column: amount / rate / years */}
                <div>
                  {/* Amount */}
                  <div className="mb-4">
                    <Label> {modeA === "sip" ? "Monthly investment" : "Investment amount"} </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">₹</div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value.replace(/[^\d.]/g, ""))}
                        onBlur={onAmountABlur}
                        className="pl-8"
                        placeholder="e.g. 25000"
                      />
                    </div>
                    <input
                      id="amountSliderA"
                      type="range"
                      min={500}
                      max={100000}
                      value={clamp(amtA || 0, 500, 100000)}
                      onChange={(e) => setAmountA(String(parseInt(e.target.value, 10)))}
                      className="w-full mt-3"
                    />
                  </div>

                  {/* Rate */}
                  <div className="mb-4">
                    <Label> Expected return rate (p.a) </Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={rateA}
                      onChange={(e) => setRateA(e.target.value.replace(/[^\d.]/g, ""))}
                      onBlur={onRateABlur}
                      placeholder="e.g. 12"
                    />
                    <input
                      id="returnSliderA"
                      type="range"
                      min={1}
                      max={30}
                      value={clamp(rA || 0, 1, 30)}
                      onChange={(e) => setRateA(String(parseInt(e.target.value, 10)))}
                      className="w-full mt-3"
                    />
                    {modeA === "fd" && (
                      <div className="text-xs mt-1 text-gray-600">FD compounding: quarterly (typical in India)</div>
                    )}
                  </div>

                  {/* Years */}
                  <div>
                    <Label> Time period (years) </Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={yearsA}
                      onChange={(e) => setYearsA(e.target.value.replace(/[^\d]/g, ""))}
                      onBlur={onYearsABlur}
                      placeholder="e.g. 10"
                    />
                    <input
                      id="timeSliderA"
                      type="range"
                      min={1}
                      max={40}
                      value={clamp(yrsA || 0, 1, 40)}
                      onChange={(e) => setYearsA(String(parseInt(e.target.value, 10)))}
                      className="w-full mt-3"
                    />
                  </div>
                </div>

                {/* Right column: step-up (if SIP) + goal + presets */}
                <div>
                  {modeA === "sip" && (
                    <div className="mb-4">
                      <Label>Annual Step-up (%)</Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={stepA}
                        onChange={(e) => setStepA(e.target.value.replace(/[^\d.]/g, ""))}
                        onBlur={onStepABlur}
                        placeholder="e.g. 10"
                      />
                      <input
                        id="stepUpSliderA"
                        type="range"
                        min={0}
                        max={30}
                        value={clamp(stpA || 0, 0, 30)}
                        onChange={(e) => setStepA(String(parseInt(e.target.value, 10)))}
                        className="w-full mt-3"
                      />
                    </div>
                  )}

                  {/* Investment Goal */}
                  <div className="mb-4">
                    <Label>Target wealth goal (for SIP)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={goalInput}
                        onChange={(e) => setGoalInput(e.target.value.replace(/[^\d.]/g, ""))}
                        placeholder="e.g. 10000000"
                      />
                      <div className="flex items-center text-sm text-gray-700">
                        {modeA === "sip" ? (
                          goalYearsResult ? (
                            <span>
                              ~{goalYearsResult} yrs to reach {formatCurrency(toNumber(goalInput, 0))}
                            </span>
                          ) : (
                            <span>Not reachable in 60 yrs with current SIP</span>
                          )
                        ) : (
                          <span className="text-xs">Goal estimation is for SIP only</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Presets */}
                  <div className="mb-4">
                    <Label>Quick examples</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {presets.map((p) => (
                        <button
                          key={p.label}
                          className="px-3 py-1 rounded bg-gray-100"
                          onClick={() => {
                            setModeA(p.mode);
                            setAmountA(p.amount);
                            setRateA(p.rate);
                            setYearsA(p.years);
                            setStepA(p.step);
                          }}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Copy to B (if compare) */}
                  {compareOpen && (
                    <div className="mt-2">
                      <button
                        className="px-3 py-2 bg-blue-600 text-white rounded"
                        onClick={copyAToB}
                      >
                        Copy A → B
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Results and actions (A & optionally B) */}
        <div>
          <Card className="p-4 mb-4">
            <CardContent>
              <h3 className="font-semibold mb-3">Scenario A Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Invested amount</span>
                  <strong>{formatCurrency(resultsA.investedAmount)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{modeA === "fd" ? "Accrued interest" : "Estimated returns"}</span>
                  <strong>{formatCurrency(resultsA.estimatedReturns)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Total value</span>
                  <strong>{formatCurrency(resultsA.totalValue)}</strong>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Button variant="outline" onClick={() => downloadPDF()}>
                  <Download className="inline-block mr-2" /> Download PDF
                </Button>
                <div className="flex gap-2 mt-2">
                  <Button onClick={() => downloadCSV("A")}><FileText className="inline mr-2" />Export CSV</Button>
                  <Button onClick={() => shareTwitter("A")}><Share2 className="inline mr-2" />Share (Twitter)</Button>
                  <Button onClick={() => shareWhatsApp("A")}>WhatsApp</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* If comparing, show Scenario B summary + actions */}
          {compareOpen && (
            <Card className="p-4">
              <CardContent>
                <h3 className="font-semibold mb-3">Scenario B Summary</h3>

                {/* Mode toggle for B */}
                <div className="inline-flex rounded-lg bg-gray-100 p-1 mb-3">
                  <button className={`px-3 py-1 rounded ${modeB === "sip" ? "bg-white" : ""}`} onClick={() => setModeB("sip")}>SIP</button>
                  <button className={`px-3 py-1 rounded ${modeB === "lumpsum" ? "bg-white" : ""}`} onClick={() => setModeB("lumpsum")}>Lumpsum</button>
                  <button className={`px-3 py-1 rounded ${modeB === "fd" ? "bg-white" : ""}`} onClick={() => setModeB("fd")}>FD</button>
                </div>

                <div className="text-sm text-gray-700 mb-2">
                  Enter B values:
                </div>

                <div className="space-y-2 mb-3">
                  <Input type="text" value={amountB} onChange={(e) => setAmountB(e.target.value.replace(/[^\d.]/g, ""))} onBlur={onAmountBBlur} placeholder="Investment amount" />
                  <Input type="text" value={rateB} onChange={(e) => setRateB(e.target.value.replace(/[^\d.]/g, ""))} onBlur={onRateBBlur} placeholder="Rate (p.a.)" />
                  <Input type="text" value={yearsB} onChange={(e) => setYearsB(e.target.value.replace(/[^\d]/g, ""))} onBlur={onYearsBBlur} placeholder="Years" />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => downloadCSV("B")}><FileText className="inline mr-2" />Export CSV</Button>
                  <Button onClick={() => shareTwitter("both")}><Share2 className="inline mr-2" />Share Compare</Button>
                </div>

              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Charts / Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardContent>
            <h4 className="font-semibold mb-3">Scenario A — Growth Over Time</h4>
            <GrowthChart data={resultsA.yearlyData} />
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent>
            <h4 className="font-semibold mb-3">Scenario A — Investment Breakdown</h4>
            <InvestmentChart investedAmount={resultsA.investedAmount} estimatedReturns={resultsA.estimatedReturns} />
          </CardContent>
        </Card>
      </div>

      {compareOpen && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-4">
            <CardContent>
              <h4 className="font-semibold mb-3">Scenario B — Growth Over Time</h4>
              <GrowthChart data={resultsB.yearlyData} />
            </CardContent>
          </Card>

          <Card className="p-4">
            <CardContent>
              <h4 className="font-semibold mb-3">Scenario B — Investment Breakdown</h4>
              <InvestmentChart investedAmount={resultsB.investedAmount} estimatedReturns={resultsB.estimatedReturns} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* SEO FAQ & CTAs */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <CardContent>
            <h3 className="font-semibold mb-3">FAQ — Quick Answers</h3>
            <details className="mb-2">
              <summary className="font-medium">Is SIP better than FD?</summary>
              <div className="mt-2 text-sm text-gray-700">
                SIP (equity SIP) offers potentially higher long-term returns but with market risk. FD gives guaranteed returns but usually lower than inflation-busting equity returns. Use both for a balanced strategy.
              </div>
            </details>

            <details className="mb-2">
              <summary className="font-medium">Can SIP make me a millionaire?</summary>
              <div className="mt-2 text-sm text-gray-700">
                Yes — with discipline and time. Regular SIPs compounded over long horizons can build substantial wealth. Use the goal calculator above to estimate years.
              </div>
            </details>

            <details className="mb-2">
              <summary className="font-medium">What is step-up SIP?</summary>
              <div className="mt-2 text-sm text-gray-700">
                Step-up SIP increases your monthly SIP by a chosen percent each year automatically — good for increasing investments as income grows.
              </div>
            </details>
          </CardContent>
        </Card>

        <Card className="p-4">
          <CardContent>
            <h3 className="font-semibold mb-3">Quick Tips</h3>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              <li>Try presets to see examples quickly.</li>
              <li>Use Compare to test SIP vs FD or different SIP step-ups.</li>
              <li>Export CSV for deeper offline analysis.</li>
              <li>Share results to social media to drive more visits.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <div>
        <p className="text-sm text-center italic text-red-600">
          * Investments are subject to market risks and results from this calculator are estimates only and not guarantees.
        </p>
      </div>
    </div>
  );
}
