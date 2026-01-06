import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Authservices } from '../services/authservices';

export const authGuard: CanActivateFn = (route, state) => {
  
  
  const authService = inject(Authservices)
  const router = inject(Router)


  const isAuth = authService.isAuthenticate();
  console.log('guard comlete', isAuth)

  if(isAuth) {
    return true;
  } else {
    router.navigate(['/login'])
    return false;
  }
};
