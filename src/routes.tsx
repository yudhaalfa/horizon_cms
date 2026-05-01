import { Icon } from '@chakra-ui/react';
import {
  MdHome,
  MdLock,
  MdAdminPanelSettings,
  MdPayment,
  MdReceipt,
  MdCheckCircle,
} from 'react-icons/md';

// Admin Imports

// Merchant Imports

// Public Imports
import PublicPayment from 'views/public/payment';
import PaymentStatus from 'views/public/status';
import InvoiceDetail from 'views/public/invoice';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import AdminControlPanel from 'views/admin';
import MerchantDashboard from 'views/merchant/default';

const routes = [
  // ========================================
  // ADMIN INTERFACE
  // ========================================
  {
    name: 'Admin Control Panel',
    layout: '/admin',
    path: '/default',
    icon: (
      <Icon
        as={MdAdminPanelSettings as any}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <AdminControlPanel />,
  },

  // ========================================
  // MERCHANT INTERFACE
  // ========================================
  {
    name: 'Merchant Dashboard',
    layout: '/merchant',
    path: '/default',
    icon: (
      <Icon as={MdHome as any} width="20px" height="20px" color="inherit" />
    ),
    component: <MerchantDashboard />,
  },

  // ========================================
  // END USER PAYMENT PAGE (Public)
  // ========================================
  {
    name: 'Public Payment',
    layout: '/public',
    path: '/payment',
    icon: (
      <Icon as={MdPayment as any} width="20px" height="20px" color="inherit" />
    ),
    component: <PublicPayment />,
  },
  {
    name: 'Payment Status',
    layout: '/public',
    path: '/status/:id',
    icon: (
      <Icon
        as={MdCheckCircle as any}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <PaymentStatus />,
  },
  {
    name: 'Invoice Detail',
    layout: '/public',
    path: '/invoice/:id',
    icon: (
      <Icon as={MdReceipt as any} width="20px" height="20px" color="inherit" />
    ),
    component: <InvoiceDetail />,
  },

  // ========================================
  // AUTHENTICATION
  // // ========================================
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: (
      <Icon as={MdLock as any} width="20px" height="20px" color="inherit" />
    ),
    component: <SignInCentered />,
    invisible: true
  },
];

export default routes;
