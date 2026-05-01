import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import './assets/css/App.css';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme'; 
import { useState } from 'react';

// Public Imports
import PublicPayment from 'views/public/payment';
import PaymentStatus from 'views/public/status';
import InvoiceDetail from 'views/public/invoice';

// Zustand Store
import { useAuthStore } from 'store/useAuthStore'; 

export default function Main() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  
  // Grab auth state from Zustand
  const { isAuthenticated, role } = useAuthStore();

  return (
    <ChakraProvider theme={currentTheme}>
      <Routes>
        {/* --- Public & Auth Routes (No Login Required) --- */}
        <Route path="auth/*" element={<AuthLayout />} />
        <Route path="public-payment" element={<PublicPayment />} />
        <Route path="public-status/:id" element={<PaymentStatus />} />
        <Route path="public-invoice/:id" element={<InvoiceDetail />} />

        {/* --- Protected Admin Routes --- */}
        <Route
          path="admin/*"
          element={
            isAuthenticated ? (
              role === 'admin' ? (
                <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} /> 
              ) : (
                <Navigate to="/merchant/default" replace />
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
            isAuthenticated && role === 'merchant' ? (
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            ) : (
              <Navigate to="/auth/sign-in" replace />
            )
          }
        />

        {/* --- RTL Layout --- */}
        <Route
          path="rtl/*"
          element={
            <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
          }
        />

        <Route 
          path="/" 
          element={
            isAuthenticated 
              ? <Navigate to={role === 'admin' ? "/admin/default" : "/merchant/default"} replace /> 
              : <Navigate to="/auth/sign-in" replace />
          } 
        />
      </Routes>
    </ChakraProvider>
  );
}
