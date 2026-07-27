/**
 * Unit tests for views/auth/signIn/index.tsx
 *
 * Tests: form rendering, email validation, login success/failure flows.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { act } from 'react';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock auth store
const mockLogin = jest.fn();
jest.mock('store/useAuthStore', () => ({
  useAuthStore: (selector: any) =>
    selector({
      login: mockLogin,
    }),
}));

import SignIn from '../../../views/auth/signIn/index';

const renderSignIn = () =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <SignIn />
      </MemoryRouter>
    </ChakraProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignIn — rendering', () => {
  it('renders Sign In heading', () => {
    renderSignIn();
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders email input', () => {
    renderSignIn();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('renders password input', () => {
    renderSignIn();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders Sign In submit button', () => {
    renderSignIn();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders Register as Merchant link', () => {
    renderSignIn();
    expect(screen.getByText(/register as merchant/i)).toBeInTheDocument();
  });
});

describe('SignIn — email validation', () => {
  it('shows error message for invalid email format', async () => {
    renderSignIn();
    const emailInput = screen.getByPlaceholderText(/enter your email/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'notanemail');
    await userEvent.type(passwordInput, 'anypassword');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });
});

describe('SignIn — login flow', () => {
  it('calls login with trimmed email and password', async () => {
    mockLogin.mockReturnValue(true);
    renderSignIn();

    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), '  admin@dbo.com  ');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), '123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@dbo.com', '123');
    });
  });

  it('navigates to / on successful login', async () => {
    mockLogin.mockReturnValue(true);
    renderSignIn();

    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'admin@dbo.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), '123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('does not navigate on failed login', async () => {
    mockLogin.mockReturnValue(false);
    renderSignIn();

    await userEvent.type(screen.getByPlaceholderText(/enter your email/i), 'admin@dbo.com');
    await userEvent.type(screen.getByPlaceholderText(/enter your password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigates to /register when register link is clicked', async () => {
    renderSignIn();
    fireEvent.click(screen.getByText(/register as merchant/i));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
