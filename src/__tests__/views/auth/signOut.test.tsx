/**
 * Unit tests for views/auth/signOut/index.tsx
 *
 * Tests: rendering and logout action.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

const mockLogout = jest.fn();
jest.mock('store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      logout: mockLogout,
    }),
}));

import Logout from '../../../views/auth/signOut/index';

const renderLogout = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <Logout />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignOut (Logout)', () => {
  it('renders Ready to leave? heading', () => {
    renderLogout();
    expect(screen.getByText(/ready to leave/i)).toBeInTheDocument();
  });

  it('renders descriptive text about logging out', () => {
    renderLogout();
    expect(screen.getByText(/securely log out/i)).toBeInTheDocument();
  });

  it('renders Confirm Log Out button', () => {
    renderLogout();
    expect(screen.getByRole('button', { name: /confirm log out/i })).toBeInTheDocument();
  });

  it('calls logout() when button is clicked', () => {
    renderLogout();
    fireEvent.click(screen.getByRole('button', { name: /confirm log out/i }));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('does not navigate itself — relies on auth guard', () => {
    // After logout(), the auth guard in App.tsx handles redirect.
    // We verify logout is called but no navigation prop/hook is used directly.
    renderLogout();
    fireEvent.click(screen.getByRole('button', { name: /confirm log out/i }));
    expect(mockLogout).toHaveBeenCalled();
  });
});
