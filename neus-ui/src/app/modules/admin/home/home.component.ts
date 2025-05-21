import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { UserProfile } from '../../../services/keycloak/userProfile';
import { KeycloakService } from '../../../services/keycloak/keycloak.service';
import { Router, RouterOutlet } from '@angular/router';
import { AdminUxService } from '../service/admin-ux/admin-ux.service';
import { CommonModule } from '@angular/common';
import { SideBarItemComponent } from "../components/side-bar-item/side-bar-item.component";
import { LayoutModule } from '@angular/cdk/layout';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterOutlet, SideBarItemComponent,LayoutModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit , OnDestroy{
  
  profile:UserProfile | undefined;
  activeComponent:string = 'Dashboard';
  showDrawer:boolean = false;
  isMobileView:boolean = false;
  private breakpointSubscription: Subscription | undefined;

  constructor(
    private keycloakService:KeycloakService,
    private router:Router,
    private adminUxService:AdminUxService,
    private breakpointObserver: BreakpointObserver
  ){
    effect(()=>{
      this.showDrawer = this.adminUxService.showDrawer();
    })
  }

  ngOnInit(): void {
    this.setActiveComponent('Dashboard');
    this.profile = this.keycloakService.profile;
    
    // on mobile view
    this.breakpointSubscription = this.breakpointObserver
      .observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape, '(max-width: 767px)'])
      .subscribe(result => {
        // If any of the observed breakpoints are matched, it's considered a mobile view
        this.isMobileView = result.matches;
      });
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
    if(this.isMobileView){
      this.adminUxService.toggleShowDrawerStatus();
    }
    this.router.navigate(['admin', component.toLocaleLowerCase()])
  }

  ngOnDestroy(): void {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

 

}
