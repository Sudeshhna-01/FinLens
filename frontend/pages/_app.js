import '../src/index.css';
import '../src/App.css';
import '../src/components/Navbar.css';
import '../src/pages/Auth.css';
import '../src/pages/Dashboard.css';
import '../src/pages/Expenses.css';
import '../src/pages/Groups.css';
import '../src/pages/Portfolio.css';
import '../src/pages/Insights.css';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RouteGate({ Component, pageProps }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (Component.requireAuth && !user) {
      router.replace('/login');
      return;
    }

    if (Component.guestOnly && user) {
      router.replace('/');
    }
  }, [Component.guestOnly, Component.requireAuth, loading, router, user]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (Component.requireAuth && !user) {
    return <div className="loading">Redirecting to login...</div>;
  }

  if (Component.guestOnly && user) {
    return <div className="loading">Redirecting...</div>;
  }

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <RouteGate Component={Component} pageProps={pageProps} />
    </AuthProvider>
  );
}
