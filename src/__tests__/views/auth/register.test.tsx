/**
 * Unit tests for views/auth/register/index.tsx
 *
 * Tests: form rendering, validation, register success/failure flows.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockRegister = jest.fn();
jest.mock('store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      register: mockRegister,
    }),
}));

import Register from '../../../views/auth/register/index';

const renderRegister = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

const fillForm = async (overrides: Record<string, string> = {}) => {
  const defaults = {
    name: 'Jane Doe',
    storeName: 'Janes Shop',
    email: 'jane@shop.com',
    password: 'secure123',
    ...overrides,
  };
  await userEvent.type(screen.getByPlaceholderText(/full name/i), defaults.name);
  await userEvent.type(screen.getByPlaceholderText(/store name/i), defaults.storeName);
  await userEvent.type(screen.getByPlaceholderText(/email address/i), defaults.email);
  await userEvent.type(screen.getByPlaceholderText(/enter your password/i), defaults.password);
};

describe('Register — rendering', () => {
  it('renders Become a Merchant heading', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /become a merchant/i })).toBeInTheDocument();
  });

  it('renders all four form fields', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/store name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders Create Account button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders Log in here link', () => {
    renderRegister();
    expect(screen.getByText(/log in here/i)).toBeInTheDocument();
  });
});

describe('Register — validation', () => {
  it('shows error for invalid email format', async () => {
    renderRegister();
    await fillForm({ email: 'badEmail' });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

describe('Register — registration flow', () => {
  it('calls register with MERCHANT role and correct data', async () => {
    mockRegister.mockReturnValue(true);
    renderRegister();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Jane Doe',
          storeName: 'Janes Shop',
          email: 'jane@shop.com',
          password: 'secure123',
          role: 'MERCHANT',
        }),
      );
    });
  });

  it('navigates to /merchant/default on success', async () => {
    mockRegister.mockReturnValue(true);
    renderRegister();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/merchant/default');
    });
  });

  it('does not navigate on duplicate email (register returns false)', async () => {
    mockRegister.mockReturnValue(false);
    renderRegister();
    await fillForm();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /auth/sign-in when Log in here is clicked', async () => {
    renderRegister();
    fireEvent.click(screen.getByText(/log in here/i));
    expect(mockNavigate).toHaveBeenCalledWith('/auth/sign-in');
  });
});
