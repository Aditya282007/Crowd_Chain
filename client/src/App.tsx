import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SignUp from "@/pages/signup";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import ProjectDetails from "@/pages/project-details";
import AdminDashboard from "@/pages/admin-dashboard";

function Router() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // Initialize WebSocket connection for real-time updates
  // useWebSocket(); // Temporarily disabled to debug auth loop

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/signup" component={SignUp} />
        <Route path="/login" component={Login} />
        <Route path="/project/:id" component={ProjectDetails} />
        {isAuthenticated && (
          <>
            <Route path="/dashboard" component={Dashboard} />
            {user?.role === "admin" && (
              <Route path="/admin" component={AdminDashboard} />
            )}
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
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
