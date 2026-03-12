import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ✅ Remove o token do localStorage — agora o cookie HttpOnly é enviado automaticamente
  // ✅ withCredentials garante que o cookie vai junto em todas as requisições
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq);
};
