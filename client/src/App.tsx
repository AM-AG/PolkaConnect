import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MultiWalletConnect } from "@/components/MultiWalletConnect";
import { WalletProvider } from "@/contexts/WalletContext";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import Swap from "@/pages/swap";
import Transfer from "@/pages/transfer";
import History from "@/pages/history";
import Community from "@/pages/community";
import Governance from "@/pages/Governance";
import Network from "@/pages/Network";
import Staking from "@/pages/staking";
import Transactions from "@/pages/transactions";
import Developer from "@/pages/Developer";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/assets" component={Assets} />
      <Route path="/swap" component={Swap} />
      <Route path="/transfer" component={Transfer} />
      <Route path="/history" component={History} />
      <Route path="/community" component={Community} />
      <Route path="/staking" component={Staking} />
      <Route path="/governance" component={Governance} />
      <Route path="/network" component={Network} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/developer" component={Developer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <TooltipProvider>
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <MultiWalletConnect />
                  </div>
                </header>
                <main className="flex-1 overflow-y-auto p-6">
                  <Router />
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
