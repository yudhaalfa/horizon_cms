import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import './assets/css/App.css';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';

import PublicPayment from 'views/public/payment';
import PaymentStatus from 'views/public/status';
import InvoiceDetail from 'views/public/invoice';
import FailedPayment from 'views/public/failedPay';

import { useAuthStore } from 'store/useAuthStore';
import Register from 'views/auth/register';

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  const user = useAuthStore((state) => state.user);

  const isAuthenticated = !!user;
  const role = user?.role;

  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />} />
        <Route path="register" element={<Register />} />
        <Route path="pay/:token" element={<PublicPayment />} />
        <Route path="payment-failed" element={<FailedPayment />} />
        <Route path="public-status/:id" element={<PaymentStatus />} />
        <Route path="public-invoice/:id" element={<InvoiceDetail />} />

        {/* --- Protected Admin Routes --- */}
        <Route
          path="admin/*"
          element={
            isAuthenticated ? (
              role === 'ADMIN' ? (
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
              ) : (
                <Navigate to="/merchant/dashboard" replace />
              )
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          }
        />

        {/* --- Protected Merchant Routes --- */}
        <Route
          path="merchant/*"
          element={
            isAuthenticated && role === 'MERCHANT' ? (
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          }
        />

        <Route
          path="rtl/*"
          element={
            <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate
                to={role === 'ADMIN' ? '/admin/default' : '/merchant/default'}
                replace
              />
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          }
        />
      </Routes>
    </ChakraProvider>
  );
}
