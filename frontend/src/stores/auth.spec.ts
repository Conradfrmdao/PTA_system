import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './auth';

const user = {
  id: 'user-1',
  email: 'learner@example.com',
  firstName: 'Amina',
  lastName: 'Learner',
  phone: null,
  role: 'LEARNER' as const,
  isActive: true,
};

describe('auth store', () => {
  beforeEach(() => useAuthStore.setState({ user: null, accessToken: null, isRestoring: true }));

  it('keeps access tokens in memory and clears the full session', () => {
    useAuthStore.getState().setSession(user, 'access-token');
    expect(useAuthStore.getState()).toMatchObject({ user, accessToken: 'access-token', isRestoring: false });

    useAuthStore.getState().clearSession();
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null, isRestoring: false });
  });
});
