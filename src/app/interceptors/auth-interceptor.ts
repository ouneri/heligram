import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { inject } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('auth_token');
  const router = inject(Router)

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(cloned).pipe(
      catchError((error) => {
        if (error.status === 401) {
          localStorage.removeItem('auth_token');
          router.navigate(['/login']);
        }
        return throwError(() => error);
      }) 
    );  
  }
  
  return next(req);
};