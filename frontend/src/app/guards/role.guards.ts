import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const agentGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (!user) {
    return router.parseUrl('/login');
  }
  if (user.role !== 'agent') {
    return router.parseUrl('/app/customer/dashboard');
  }
  return true;
};

export const customerGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.getUser();
  if (!user) {
    return router.parseUrl('/login');
  }
  if (user.role !== 'customer') {
    return router.parseUrl('/app/agent/dashboard');
  }
  return true;
};
