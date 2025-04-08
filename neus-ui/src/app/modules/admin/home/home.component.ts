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
  onShawDrawer:boolean = false;
  activeComponent:string = 'Resources';

  constructor(
    private keycloakService:KeycloakService,
    private router:Router,
    private adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.setActiveComponent('Resources');
    this.profile = this.keycloakService.profile;
    // get show drawer 
    this.adminUxService.showDrawer$.subscribe((onShawDrawer:boolean)=>{
      this.onShawDrawer = onShawDrawer;
    });
  }

  // logout
  logout(){
    this.keycloakService.logout();
  }

  // toggle side bar
  toggleSideBar() {
    this.onShawDrawer = !this.onShawDrawer;
    this.updateShowDrawer(this.onShawDrawer);
  }

  // set active component
  setActiveComponent(component:string){
    this.activeComponent = component;
    this.router.navigate(['admin', component.toLocaleLowerCase()])
  }

  // update show drawer
  updateShowDrawer(show:boolean){
    this.adminUxService.updateShowDrawerStatus(show);
  }

}
