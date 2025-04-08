import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import  Keycloak  from 'keycloak-js';
import { UserProfile } from './userProfile';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private _KeyCloak: Keycloak | undefined;
  private _profile: UserProfile | undefined;

  constructor(private router:Router) { }

  get keycloak(){
    if(!this._KeyCloak){
      this._KeyCloak = new Keycloak({
        url: environment.keycloakUrl ,
        realm: environment.realm, 
        clientId: environment.clientId, 
      })
    }
    return this._KeyCloak;
  } 

  get profile():any{
    return this._profile;
  }


  async init(){
    const authenticated = await this.keycloak?.init({
         onLoad: 'check-sso',
         checkLoginIframe: false,
    });

    if(authenticated){
      this._profile = (await this.keycloak?.loadUserProfile()) as UserProfile;
      // Start token refresh mechanism
      this.startTokenRefresh();

      if(this.isAdminUser){
        this.router.navigate(['admin'])
      } else {
        this.router.navigate(['user']);
      }
    }
  }

  login(){
    return this.keycloak?.login();
  }

  logout(){
    return this.keycloak?.logout({
      redirectUri: environment.redirectUrl
    });
  }

  // is token valid
  get isTokenValid(){
    return !this.keycloak.isTokenExpired();
  }

  // is authenticated
  get isAuthenticated(): boolean {
    return this.keycloak?.authenticated ?? false;
  }

  //account management
  accountManagement(){
    this.keycloak.accountManagement();
  }


  // decode the users role
  get isAdminUser():boolean{
    const parsedToken = this.keycloak.tokenParsed;
    const roles:string[] = parsedToken?.realm_access?.roles as string[];

    if(roles.includes('ADMIN')){
      return true;
    }
      return false;
  }

  // Get the current access token
  getToken(): string | undefined {
    return this.keycloak.token;
  }

  // Refresh the token manually
  async refreshToken(): Promise<boolean> {
    try {
      const refreshed = await this.keycloak.updateToken(-1); // -1 forces refresh regardless of expiry
      return refreshed;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  // Proactive token refresh before expiry
  private startTokenRefresh() {
    setInterval(async () => {
      if (this.keycloak.isTokenExpired(300)) { // Refresh if token expires in 5 minutes
        const refreshed = await this.refreshToken();
        if (!refreshed) {
          this.logout(); // Fallback: logout if refresh fails
        }
      }
    }, 600000); // Check every 10 minute
  }
}
