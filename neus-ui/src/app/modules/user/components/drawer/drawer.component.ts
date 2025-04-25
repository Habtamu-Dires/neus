import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DrawerItemComponent } from "../drawer-item/drawer-item.component";
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { UserDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-drawer',
  imports: [DrawerItemComponent,CommonModule],
  templateUrl: './drawer.component.html',
  styleUrl: './drawer.component.css'
})
export class DrawerComponent implements OnInit{
  @Input() selectedComponent:string = 'home';
  @Output() onComponentSelect = new EventEmitter<string>();
  plan:string = 'Subscribe';
  isLoggedIn: boolean = false;
  subscriptionLevel: string | undefined;

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
    this.onComponentSelect.emit(component);
  }

  login(){
    this.keycloakService.login();
  }

  logout(){
    this.keycloakService.logout();
  }
}
