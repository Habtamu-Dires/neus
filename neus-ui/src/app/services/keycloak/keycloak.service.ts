import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import  Keycloak  from 'keycloak-js';
import { UserProfile } from './userProfile';
import { UsersService } from '../services';
import { ToastrService } from 'ngx-toastr';
import { SharedStateService } from '../shared-state/shared-state.service';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private _KeyCloak: Keycloak | undefined;
  private _profile: UserProfile | undefined;

  constructor(
    private router:Router,
    private userService:UsersService,
    private toastrService:ToastrService,
    private sharedStateService:SharedStateService
  ) { }

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
      const attributes = (((await this.keycloak.loadUserProfile()).attributes));
      console.log("attributes " + attributes);
      console.log("syncronized " + this._profile.syncronized);

      // check if the user is syncronized
      if(attributes){
        const arr = attributes['synchronized'] as string[];
        this._profile.syncronized = arr[0] as string;
        console.log("Syncronized ==> " + this._profile.syncronized);

        if(this._profile.syncronized !== 'true' && this._profile.email){
          this.syncronizeUser(this._profile.email);
        }
      } 
      // attributes not present
      else if(!this.profile.synchronized && this._profile.email){
        this.syncronizeUser(this._profile.email);
      }
      
      // check if the user is admin
      if(this.isAdminUser){
        this.router.navigate(['admin'])
      } else {
        this.router.navigate(['user']);
      }
    } 
  }

  // syncronize the user
  syncronizeUser(email:string){
    this.sharedStateService.updateIsSyncronizing(true);
    this.userService.saveUser({
      'email': email,
    }).subscribe({
      next:() => {
        this.sharedStateService.updateIsSyncronizing(false);
        console.log("sucess");
        this.toastrService.success("User Syncronized", "Success");
      },
      error:(err) => {
        console.log(err);
        this.toastrService.error("User Syncronization Failed", "Try Again");
        setTimeout(() => {
          this.logout();
        }, 2000);
      }
    })
  }

  // login
  login(){
    return this.keycloak?.login();
  }

  // logout
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

  // decode the user subscription level
  get subscriptionLevel():any{
    const parsedToken = this.keycloak.tokenParsed;
    const roles:string[] = parsedToken?.realm_access?.roles as string[];
    if(roles.includes('premium_subscriber')){
      return 'premium_subscriber'
    } else if(roles.includes('advanced_subscriber')){
      return 'advanced_subscriber'
    } else if(roles.includes('basic_subscriber')){
      return 'basic_subscriber'
    } else {
      return undefined;
    }
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
      const refreshed = await this.refreshToken();
      if (this.keycloak.isTokenExpired(300)) { // Refresh if token expires in 5 minutes [ 300]
        const refreshed = await this.refreshToken();
        console.log('Token refreshed:', refreshed);
        if (!refreshed) {
          this.logout(); // Fallback: logout if refresh fails
        }
      }
    }, 10000); // Check every 10 minute 600,000
  }
}
