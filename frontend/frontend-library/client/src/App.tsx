import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login-page";
import RegisterPage from "@/pages/register-page";
import BooksPage from "@/pages/books-page";
import LoansPage from "@/pages/loans-page";
import UsersPage from "@/pages/users-page";
import { authService } from "@/lib/auth-service";

// Protected Route Wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!authService.isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/books">
        {() => <ProtectedRoute component={BooksPage} />}
      </Route>
      
      <Route path="/loans">
        {() => <ProtectedRoute component={LoansPage} />}
      </Route>
      
      <Route path="/users">
        {() => <ProtectedRoute component={UsersPage} />}
      </Route>
      
      {/* Default redirect to books or login */}
      <Route path="/">
        {() => authService.isAuthenticated() ? <Redirect to="/books" /> : <Redirect to="/login" />}
      </Route>

      {/* Fallback to 404 */}
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
