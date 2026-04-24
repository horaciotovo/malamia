import React, { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminAuthStore } from './store/authStore';
import { authApi } from './services/api';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import CustomerList from './pages/customers/CustomerList';
import AdminManagement from './pages/admin/AdminManagement';
import NotificationCenter from './pages/notifications/NotificationCenter';
import Leaderboard from './pages/loyalty/Leaderboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const initFromStorage = useAdminAuthStore((s) => s.initFromStorage);
  const setAuthFromUser = useAdminAuthStore((s) => s.setAuthFromUser);
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Check for token in URL (from mobile app redirect)
      const tokenFromUrl = searchParams.get('token');
      
      if (tokenFromUrl) {
        // Store token from URL for automatic login
        localStorage.setItem('adminToken', tokenFromUrl);
        
        // Fetch user data with the token
        authApi.getCurrentUser()
          .then(({ data }) => {
            const user = data.data;
            localStorage.setItem('adminUser', JSON.stringify(user));
            setAuthFromUser(user);
          })
          .catch(() => {
            // Token is invalid, redirect to login
            localStorage.removeItem('adminToken');
            window.location.href = '/login';
          });
      } else {
        initFromStorage();
      }
    }
  }, [initFromStorage, setAuthFromUser, searchParams]);

  useEffect(() => {
    // Navigate to product/category if needed
    if (isAuthenticated) {
      const productId = searchParams.get('productId');
      const categoryId = searchParams.get('categoryId');
      
      if (productId) {
        navigate(`/products/${productId}/edit`);
      } else if (categoryId) {
        navigate(`/admin/categories?id=${categoryId}`);
      }
    }
  }, [isAuthenticated, searchParams, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="admin/users" element={<AdminManagement />} />
        <Route path="notifications" element={<NotificationCenter />} />
        <Route path="loyalty" element={<Leaderboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
