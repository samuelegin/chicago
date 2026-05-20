import { Toaster } from "@/components/ui/sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminRoute from '@/components/layout/AdminRoute';
import Feed from '@/pages/Feed';
import Leaderboard from '@/pages/Leaderboard';
import Profile from '@/pages/Profile';
import AdMarketplace from '@/pages/AdMarketplace';
import Admin from '@/pages/Admin';
import Staking from '@/pages/Staking';
import Login from '@/pages/Login';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-5">
      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm">
        <img src="/logo.jpg" alt="Chicago" className="w-full h-full object-cover" />
      </div>
      <div className="w-5 h-5 border-2 border-neutral-200 border-t-neutral-800 rounded-full animate-spin" />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white p-6">
      <div className="max-w-xs w-full text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm mx-auto">
          <img src="/logo.jpg" alt="Chicago" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-base font-semibold">Access Required</p>
          <p className="text-sm text-neutral-500 mt-1">You are not registered. Contact an admin to request access.</p>
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full py-2.5 rounded-md text-sm font-semibold bg-foreground text-white hover:bg-foreground/90 transition-colors"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) return <LoadingScreen />;

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') return <AccessDenied />;
    if (authError.type === 'auth_required') { navigateToLogin(); return null; }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/"                element={<Feed />}         />
        <Route path="/leaderboard"     element={<Leaderboard />}  />
        <Route path="/profile"         element={<Profile />}      />
        <Route path="/profile/:userId" element={<Profile />}      />
        <Route path="/staking"         element={<Staking />}      />
        <Route path="/ads"             element={<AdMarketplace />}/>
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
