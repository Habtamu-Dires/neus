import { Component, EventEmitter, Output } from '@angular/core';
import { DrawerComponent } from "../drawer/drawer.component";
import { CommonModule } from '@angular/common';
import { DrawerItemComponent } from "../drawer-item/drawer-item.component";
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';

@Component({
  selector: 'app-header',
  imports: [DrawerComponent, CommonModule, DrawerItemComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  selectedComponent = 'home';
  // onMobileView:boolean = true;
  showDrawer:boolean = false;
  @Output() onSectionSelected = new EventEmitter<string>();
  @Output() onShowDrawer = new EventEmitter<boolean>();

  isLoggedIn:boolean = false;
  subscriptionLevel: string | undefined;
  plan:string = 'SUBSCRIBE';

  constructor(
    private keycloakService:KeycloakService
  ){}

  ngOnInit(): void {
    this.isLoggedIn = this.keycloakService.isAuthenticated;
    if (this.isLoggedIn) {
      const subscriptionType = this.keycloakService.subscriptionLevel as string;
      if(subscriptionType){
        this.subscriptionLevel = subscriptionType.replace('_subscriber','').toUpperCase();
        this.plan = 'Your Plan'
      } else {
        this.plan = 'Choose Plan';
      }
    } 
  }

  selectComponent(component:string){
    this.selectedComponent = component;
    this.onSectionSelected.emit(component);
  }

  // from drawer on small screen
  onSelectComponet(component:string){
    this.selectedComponent = component;
    this.onSectionSelected.emit(component);
    this.toggleDrawer();
  }

  // open drawer
  toggleDrawer(){
    this.showDrawer = !this.showDrawer;
    this.onShowDrawer.emit(this.showDrawer);
  }

  // login
  login(){
    this.keycloakService.login();
  }

  // logout
  logout(){
    this.keycloakService.logout();
  }

}
