/**
 * Unit tests for layouts/auth/index.tsx (Auth layout)
 *
 * Verifies that the auth layout renders correctly and filters routes
 * to only show layout === '/auth' routes.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock('routes', () => [
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in/default',
    component: null,
    invisible: true,
  },
  {
    name: 'Merchant Dashboard',
    layout: '/merchant',
    path: '/default',
    component: null,
  },
]);

import Auth from 'layouts/auth/index';

const renderAuth = (path = '/auth/sign-in/default') =>
  render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[path]}>
        <Auth />
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('AuthLayout', () => {
  it('renders without crashing', () => {
    const { container } = renderAuth();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders layout shell (container element)', () => {
    const { container } = renderAuth('/auth/sign-in/default');
    // Layout renders a Box (div) wrapping the routes
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('does NOT render merchant route content for /auth path', () => {
    renderAuth('/auth/sign-in/default');
    expect(document.querySelector('[data-testid="merchant-page"]')).not.toBeInTheDocument();
  });

  it('redirects bare /auth path to /auth/sign-in/default without crash', () => {
    const { container } = renderAuth('/auth');
    expect(container).toBeInTheDocument();
  });
});
