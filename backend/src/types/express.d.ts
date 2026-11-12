import type { AuthUser } from '../auth/types/auth-user.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
