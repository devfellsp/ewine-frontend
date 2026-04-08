import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const authReq = req.clone({
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  });

  return next(authReq);
};
