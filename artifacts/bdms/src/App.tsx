import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { Loader2 } from 'lucide-react';

import { Shell } from '@/components/layout/Shell';
import { useAuth } from '@/store/auth';

// Pages
import Login from '@/pages/login';
import BdoApply from '@/pages/bdo-apply';
import Assessment from '@/pages/assessment';
import Dashboard from '@/pages/dashboard';
import BdoApplications from '@/pages/bdo-applications';
import BdoDirectory from '@/pages/bdo-directory';
import BdoProfile from '@/pages/bdo-profile';
import Leads from '@/pages/leads';
import LeadDetail from '@/pages/lead-detail';
import Customers from '@/pages/customers';
import CustomerProfile from '@/pages/customer-profile';
import EngineeringDesigns from '@/pages/engineering-designs';
import EngineeringQueue from '@/pages/engineering-queue';
import EngineeringCalculator from '@/pages/engineering-calculator';
import Inventory from '@/pages/inventory';
import Invoices from '@/pages/invoices';
import InvoiceDetail from '@/pages/invoice-detail';
import Commission from '@/pages/commission';
import Finance from '@/pages/finance';
import Settings from '@/pages/settings';
import Training from '@/pages/training';
import TrainingWorkbook from '@/pages/training-workbook';
import Broadcasts from '@/pages/broadcasts';
import Onboard from '@/pages/onboard';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  const [location] = useLocation();
  const { user, initialized, refresh } = useAuth();

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Public — no auth, no shell
  if (
    location.startsWith('/apply') ||
    location.startsWith('/assessment') ||
    location.startsWith('/training') ||
    location.startsWith('/onboard')
  ) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/apply" component={BdoApply} />
          <Route path="/assessment" component={Assessment} />
          <Route path="/training/workbook" component={TrainingWorkbook} />
          <Route path="/training" component={Training} />
          <Route path="/onboard" component={Onboard} />
        </Switch>
      </RoutedErrorBoundary>
    );
  }

  // Show spinner while session is being verified
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Login page
  if (location === '/login') {
    return user ? <Redirect to="/" /> : <Login />;
  }

  // All other routes require auth
  if (!user) {
    return <Redirect to="/login" />;
  }

  return (
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/" component={Dashboard} />

          <Route path="/bdo/applications" component={BdoApplications} />
          <Route path="/bdo/directory" component={BdoDirectory} />
          <Route path="/bdo/:id" component={BdoProfile} />

          <Route path="/leads" component={Leads} />
          <Route path="/leads/:id" component={LeadDetail} />

          <Route path="/customers" component={Customers} />
          <Route path="/customers/:id" component={CustomerProfile} />

          <Route path="/engineering/queue" component={EngineeringQueue} />
          <Route path="/engineering/designs" component={EngineeringDesigns} />
          <Route path="/engineering/calculator" component={EngineeringCalculator} />

          <Route path="/inventory" component={Inventory} />

          <Route path="/invoicing" component={Invoices} />
          <Route path="/invoicing/:id" component={InvoiceDetail} />

          <Route path="/commission" component={Commission} />
          <Route path="/finance" component={Finance} />

          <Route path="/settings" component={Settings} />
          <Route path="/broadcasts" component={Broadcasts} />

          <Route component={NotFound} />
        </Switch>
      </Shell>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
