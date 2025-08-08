import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Coordination from "@/pages/coordination";
import Monitoring from "@/pages/monitoring";
import Incidents from "@/pages/incidents";
import IncidentHistory from "@/pages/incident-history";
import Alerts from "@/pages/alerts";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/coordination" component={Coordination} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/incidents" component={Incidents} />
      <Route path="/incidents/history" component={IncidentHistory} />
      <Route path="/alerts" component={Alerts} />
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
