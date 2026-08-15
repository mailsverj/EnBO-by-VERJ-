import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import { Shell } from '@/components/layout/Shell';

// Pages
import Login from '@/pages/login';
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

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Shell>
        <Switch>
          <Route path="/login" component={Login} />
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
