import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

const publicPaths = [
  '/auth/login',
  '/auth/register-acheteur',
  '/auth/verify-email',
  '/auth/resend-verification',
  '/auth/refresh'
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isPublic = publicPaths.some(path => req.url.includes(path));

  if (!isApiRequest || isPublic) {
    return next(req);
  }

  const token = auth.getAccessToken();
  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
