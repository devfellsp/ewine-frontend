import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const isAuthRequest = req.url.endsWith('/auth');

  const authReq = req.clone({
    setHeaders: token && !isAuthRequest ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  });

  return next(authReq);
};
