import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (token) {
    // Evitar duplicar el prefijo "Bearer " si el backend ya lo envía incluido
    const raw = String(token).trim();
    const headerValue = /^Bearer\s+/i.test(raw) ? raw : `Bearer ${raw}`;
    const authReq = req.clone({
      setHeaders: { Authorization: headerValue }
    });
    return next(authReq);
  }

  return next(req);
};
