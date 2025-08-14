import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import SIPCalculatorPage from "@/pages/sip-calculator";
import ComparePage from "@/pages/compare";
import BlogPage from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import PPF from "@/pages/ppf";
import GoalCalculator from "@/pages/goal-calculator";
import SipVsLumpsum from "@/pages/sip-vs-lumpsum";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/sip-calculator" component={SIPCalculatorPage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPost} />
      <Route path="/ppf" component={PPF} />
      <Route path="/goal-calculator" component={GoalCalculator} />
      <Route path="/sip-vs-lumpsum" component={SipVsLumpsum} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
