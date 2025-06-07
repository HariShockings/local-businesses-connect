import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import 'react-toastify/dist/ReactToastify.css';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import ManageBusinesses from './pages/ManageBusinesses';
import ServiceOfferings from './pages/ServiceOfferings';
import CustomerInteractions from './pages/CustomerInteractions';
import CommunityResources from './pages/CommunityResources';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import axios from 'axios';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      try {
        await axios.get('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setIsAuthenticated(true);
      } catch (err) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    };
    validateToken();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="mt-4 text-gray-700 dark:text-gray-300">Verifying...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading Business Connect...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route
            index
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="businesses"
            element={
              <ProtectedRoute>
                <ManageBusinesses />
              </ProtectedRoute>
            }
          />
          <Route
            path="services"
            element={
              <ProtectedRoute>
                <ServiceOfferings />
              </ProtectedRoute>
            }
          />
          <Route
            path="interactions"
            element={
              <ProtectedRoute>
                <CustomerInteractions />
              </ProtectedRoute>
            }
          />
          <Route
            path="resources"
            element={
              <ProtectedRoute>
                <CommunityResources />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;