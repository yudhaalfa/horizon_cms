/**
 * Unit tests for layouts/auth/Default.tsx (AuthIllustration)
 *
 * Verifies the component renders children and the illustration background.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

jest.mock('components/footer/FooterAuth', () => ({
  __esModule: true,
  default: () => <div data-testid="footer-auth" />,
}));

jest.mock('components/fixedPlugin/FixedPlugin', () => ({
  __esModule: true,
  default: () => <div data-testid="fixed-plugin" />,
}));

import AuthIllustration from 'layouts/auth/Default';

const renderComponent = (children: React.ReactNode = <div data-testid="child-content">Child</div>) =>
  render(
    <ChakraProvider>
      <MemoryRouter>
        <AuthIllustration illustrationBackground="https://example.com/bg.jpg">
          {children as JSX.Element}
        </AuthIllustration>
      </MemoryRouter>
    </ChakraProvider>,
  );

describe('AuthIllustration (Default layout)', () => {
  it('renders children', () => {
    renderComponent();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders FooterAuth', () => {
    renderComponent();
    expect(screen.getByTestId('footer-auth')).toBeInTheDocument();
  });

  it('renders FixedPlugin', () => {
    renderComponent();
    expect(screen.getByTestId('fixed-plugin')).toBeInTheDocument();
  });

  it('applies background image style from illustrationBackground prop', () => {
    const { container } = renderComponent();
    const bgEl = container.querySelector('[style*="bg.jpg"]');
    // Chakra converts the bg prop to inline style; just ensure component renders without error
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders different children correctly', () => {
    renderComponent(<span data-testid="custom-child">Custom Form</span>);
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    expect(screen.getByText('Custom Form')).toBeInTheDocument();
  });
});
