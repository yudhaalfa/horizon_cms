import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  // MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/merchant/default';
import NFTMarketplace from 'views/merchant/marketplace';
// import Profile from 'views/admin/profile';
import DataTables from 'views/merchant/dataTables';

// Auth Imports
import SignInCentered from 'views/auth/signIn';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: (
      <Icon as={MdHome as any} width="20px" height="20px" color="inherit" />
    ),
    component: <MainDashboard />,
  },
  {
    name: 'NFT Marketplace',
    layout: '/admin',
    path: '/nft-marketplace',
    icon: (
      <Icon
        as={MdOutlineShoppingCart as any}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: 'Data Tables',
    layout: '/admin',
    icon: (
      <Icon as={MdBarChart as any} width="20px" height="20px" color="inherit" />
    ),
    path: '/data-tables',
    component: <DataTables />,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: (
      <Icon as={MdLock as any} width="20px" height="20px" color="inherit" />
    ),
    component: <SignInCentered />,
  },
];

export default routes;
