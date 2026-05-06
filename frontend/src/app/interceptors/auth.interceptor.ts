import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const user = auth.getUser();

  let headers = req.headers;
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  if (user) {
    headers = headers.set('X-User-Id', user.id);
    headers = headers.set('X-User-Role', user.role);
  }

  return next(req.clone({ headers }));
};
