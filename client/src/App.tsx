import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BarChart3, MessageSquare } from "lucide-react";
import Dashboard from "@/pages/dashboard";
import Insights from "@/pages/insights";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-white">Dynamic HNI AI</h1>
              <div className="flex space-x-1">
                <Link href="/">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      location === "/" 
                        ? "bg-purple-600 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Research
                  </button>
                </Link>
                <Link href="/insights">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      location === "/insights" 
                        ? "bg-purple-600 text-white" 
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    Insights
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/insights" component={Insights} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
