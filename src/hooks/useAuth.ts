import { useAuth as useAuthContext } from '../lib/auth-context';
import { AppRole } from '../types';

export function useAuth() {
  const auth = useAuthContext();

  const hasPermission = (allowedRoles: AppRole[]): boolean => {
    if (auth.role === 'admin') return true;
    return allowedRoles.includes(auth.role);
  };

  const isRole = (checkRole: AppRole): boolean => {
    return auth.role === checkRole;
  };

  return {
    ...auth,
    hasPermission,
    isRole,
  };
}
