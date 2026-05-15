import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import OAuthCallbackPage from './pages/auth/OAuthCallbackPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CreatePollPage from './pages/polls/CreatePollPage';
import EditPollPage from './pages/polls/EditPollPage';
import MyPollsPage from './pages/polls/MyPollsPage';
import RespondPage from './pages/respond/RespondPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

// Components
import { ProtectedRoute } from './components/layout/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
          <Route path="/p/:shareToken" element={<RespondPage />} />
          
          {/* Results view (reusing analytics or a specific simplified results page could go here) */}
          <Route path="/p/:shareToken/results" element={<RespondPage />} /> 

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/polls/create" element={<CreatePollPage />} />
            <Route path="/polls/:id/edit" element={<EditPollPage />} />
            <Route path="/polls/mine" element={<MyPollsPage />} />
            <Route path="/polls/:id/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
