import { Component } from '@angular/core';
import { UserProfile } from '../../../services/keycloak/userProfile';
import { KeycloakService } from '../../../services/keycloak/keycloak.service';
import { Router, RouterOutlet } from '@angular/router';
import { AdminUxService } from '../service/admin-ux/admin-ux.service';
import { CommonModule } from '@angular/common';
import { SideBarItemComponent } from "../components/side-bar-item/side-bar-item.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterOutlet, SideBarItemComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  profile:UserProfile | undefined;
  activeComponent:string = 'Exams';

  constructor(
    private keycloakService:KeycloakService,
    private router:Router,
    public adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.setActiveComponent('Exams');
    this.profile = this.keycloakService.profile;
  }

  // logout
  logout(){
    this.keycloakService.logout();
  }

  // toggle side bar
  toggleSideBar() {
    this.adminUxService.toggleShowDrawerStatus();
  }

  // set active component
  setActiveComponent(component:string){
    this.activeComponent = component;
    this.router.navigate(['admin', component.toLocaleLowerCase()])
  }

}
