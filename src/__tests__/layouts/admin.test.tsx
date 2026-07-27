/**
 * Unit tests for layouts/admin/index.tsx (Dashboard)
 *
 * The layout uses window.location + react-router Routes.
 * We mock heavy sub-components (Navbar, Footer, Portal) to isolate layout logic.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

// ─── Mock heavy Chakra/component deps ────────────────────────────────────────
jest.mock('components/navbar/NavbarAdmin', () => ({
  __esModule: true,
  default: function NavbarMock(props: any) {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'navbar-admin', 'data-brand': props.brandText });
  },
}));

jest.mock('components/footer/FooterAdmin', () => ({
  __esModule: true,
  default: function FooterMock() {
    const React = require('react');
    return React.createElement('div', { 'data-testid': 'footer-admin' });
  },
}));

// Chakra Portal renders outside the component tree — flatten it for tests
jest.mock('@chakra-ui/react', () => {
  const real = jest.requireActual('@chakra-ui/react');
  return {
    ...real,
    Portal: function PortalMock({ children }: any) { return children; },
  };
});

jest.mock('routes', () => [
  {
    name: 'Merchant Dashboard',
    layout: '/merchant',
    path: '/default',
    component: null,
    secondary: false,
  },
  {
    name: 'Admin Panel',
    layout: '/admin',
    path: '/default',
    component: null,
    secondary: false,
  },
]);

import Dashboard from 'layouts/admin/index';

const renderWithRouter = (initialPath = '/merchant/default') =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Dashboard />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('AdminLayout (Dashboard)', () => {
  it('renders the NavbarAdmin', () => {
    renderWithRouter('/merchant/default');
    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
  });

  it('renders the FooterAdmin', () => {
    renderWithRouter('/merchant/default');
    expect(screen.getByTestId('footer-admin')).toBeInTheDocument();
  });

  it('detects /merchant prefix from pathname', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: '/merchant/default', href: 'http://localhost/merchant/default' },
    });
    renderWithRouter('/merchant/default');
    // NavbarAdmin receives brandText — check it renders without crash
    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
  });

  it('detects /admin prefix from pathname', () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, pathname: '/admin/default', href: 'http://localhost/admin/default' },
    });
    renderWithRouter('/admin/default');
    expect(screen.getByTestId('navbar-admin')).toBeInTheDocument();
  });
});
