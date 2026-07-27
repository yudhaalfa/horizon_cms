/**
 * Unit tests for useAuthStore
 * Pure Zustand logic — no DOM required.
 * Run: npm run test:unit -- --testPathPattern=useAuthStore
 */

import { act } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

// Reset store state before each test to avoid cross-test pollution
beforeEach(() => {
  act(() => {
    useAuthStore.setState({
      user: null,
      usersDatabase: [
        {
          id: 'ADM-001',
          name: 'Super Admin',
          email: 'admin@dbo.com',
          password: '123',
          role: 'ADMIN',
        },
      ],
    });
  });
});

describe('useAuthStore — initial state', () => {
  it('starts with no logged-in user', () => {
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('seeds admin account in usersDatabase', () => {
    const { usersDatabase } = useAuthStore.getState();
    const admin = usersDatabase.find((u) => u.email === 'admin@dbo.com');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('ADMIN');
    expect(admin?.id).toBe('ADM-001');
  });
});

describe('useAuthStore — login()', () => {
  it('returns true and sets user on valid credentials', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().login('admin@dbo.com', '123');
    });
    expect(result!).toBe(true);
    const { user } = useAuthStore.getState();
    expect(user).not.toBeNull();
    expect(user?.email).toBe('admin@dbo.com');
    expect(user?.role).toBe('ADMIN');
  });

  it('returns false and user stays null on wrong password', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().login('admin@dbo.com', 'wrongpass');
    });
    expect(result!).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('returns false for unknown email', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().login('nobody@test.com', '123');
    });
    expect(result!).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('is case-sensitive for email', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().login('Admin@dbo.com', '123');
    });
    expect(result!).toBe(false);
  });
});

describe('useAuthStore — register()', () => {
  const merchantData = {
    name: 'John Doe',
    storeName: 'Johns Store',
    email: 'john@merchant.com',
    password: 'secret123',
    role: 'MERCHANT' as const,
  };

  it('returns true and adds user with MERCHANT role', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().register(merchantData);
    });
    expect(result!).toBe(true);
    const { usersDatabase, user } = useAuthStore.getState();
    const newUser = usersDatabase.find((u) => u.email === 'john@merchant.com');
    expect(newUser).toBeDefined();
    expect(newUser?.role).toBe('MERCHANT');
    expect(newUser?.storeName).toBe('Johns Store');
    // auto-login after register
    expect(user?.email).toBe('john@merchant.com');
  });

  it('generates a MERCH- prefixed id', () => {
    act(() => {
      useAuthStore.getState().register(merchantData);
    });
    const { usersDatabase } = useAuthStore.getState();
    const newUser = usersDatabase.find((u) => u.email === 'john@merchant.com');
    expect(newUser?.id).toMatch(/^MERCH-\d{4}$/);
  });

  it('returns false when email already exists', () => {
    act(() => {
      useAuthStore.getState().register(merchantData);
    });
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().register(merchantData);
    });
    expect(result!).toBe(false);
  });

  it('cannot register with admin email', () => {
    let result: boolean;
    act(() => {
      result = useAuthStore.getState().register({
        ...merchantData,
        email: 'admin@dbo.com',
      });
    });
    expect(result!).toBe(false);
  });
});

describe('useAuthStore — logout()', () => {
  it('sets user to null', () => {
    act(() => {
      useAuthStore.getState().login('admin@dbo.com', '123');
    });
    expect(useAuthStore.getState().user).not.toBeNull();

    act(() => {
      useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('does not clear usersDatabase on logout', () => {
    act(() => {
      useAuthStore.getState().login('admin@dbo.com', '123');
      useAuthStore.getState().logout();
    });
    expect(useAuthStore.getState().usersDatabase.length).toBeGreaterThan(0);
  });
});
