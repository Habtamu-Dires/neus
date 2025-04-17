import { HttpErrorResponse, HttpHeaders, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { KeycloakService } from '../keycloak/keycloak.service';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloakService = inject(KeycloakService);
  let token = keycloakService.keycloak.token;
  
  // Function to add token to request
  const addToken = (request: HttpRequest<any>, token: string) =>
    request.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });

  // Initial request with token if available
  const handleRequest = (request: HttpRequest<any>) =>
    next(token ? addToken(request, token) : request).pipe(
      catchError((error: HttpErrorResponse) => {
        // if (error.status === 401) {
        //   // Token might be expired, attempt refresh
        //   return from(keycloakService.refreshToken()).pipe(
        //     switchMap((refreshed) => {
        //       if (refreshed) {
        //         token = keycloakService.getToken(); // Update token
        //         return next(addToken(req, token as string)); // Retry with new token
        //       } else {
        //         keycloakService.logout(); // Logout if refresh fails
        //         return throwError(() => new Error('Token refresh failed'));
        //       }
        //     }),
        //     catchError((refreshError) => {
        //       keycloakService.logout(); // Logout on refresh failure
        //       return throwError(() => refreshError);
        //     })
        //   );
        // }
        return throwError(() => error); // Pass other errors through
      })
    );

  return handleRequest(req);
};
