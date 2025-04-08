import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../keycloak/keycloak.service';

export const authGuard: CanActivateFn = (route, state) => {

  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  
  if(!keycloakService.isAuthenticated){
    keycloakService.login();
    return false;
  }

  // optional:
  if (!keycloakService.isAdminUser && route.routeConfig?.path === 'admin') {
    router.navigate(['user']);
    return false;
  }
  
  return true;
};
