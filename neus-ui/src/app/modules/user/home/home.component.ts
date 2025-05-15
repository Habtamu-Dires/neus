import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../components/header/header.component";
import { CommonModule } from '@angular/common';
import { HeroComponent } from "../components/hero/hero.component";
import { ResourcesComponent } from "../components/resources/resources.component";
import { FooterComponent } from "../components/footer/footer.component";
import { SubscriptionsComponent } from "../components/subscriptions/subscriptions.component";
import { KeycloakService } from '../../../services/keycloak/keycloak.service';
import { SharedStateService } from '../../../services/shared-state/shared-state.service';
import { UserSharedStateService } from '../services/user-shared-state.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, HeroComponent, ResourcesComponent, FooterComponent, SubscriptionsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  selectedSection:string = 'Home';
  drawerShown:boolean = false;
  isLoggedIn:boolean = false;

  constructor(
    private keycloakService:KeycloakService,
    public sharedStateService:SharedStateService,
    public userSharedStateService:UserSharedStateService,
    private activatedRoute:ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = this.keycloakService.isAuthenticated;
    if(this.isLoggedIn){
      const subscriptionType = this.keycloakService.subscriptionLevel as string;
      if(subscriptionType){
        const level = subscriptionType.replace('_subscriber','').toUpperCase();
        this.userSharedStateService.updateSubscriptionLevel(level as 'NONE' | 'BASIC' | 'ADVANCED' | 'PREMIUM' | undefined);
      }
    }
    // scroll back to resouces if it from resouce detail.
    const scrollToResources = this.activatedRoute.snapshot.queryParams['from-resource-detail'];
    if(scrollToResources){
      this.scrollToSection('resources');
    } else {
      this.scrollToSection('home');
    }
  }

  onSectionSelected(section:any){
    if(section === 'profile'){
      this.keycloakService.accountManagement()
    } 
    this.selectedSection = section;
    this.scrollToSection(section.toLocaleLowerCase());
  }

  onShawDrawer(showDrawer:any){
    this.drawerShown = showDrawer;
  }

  scrollToSection(sectionId: string) {
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 50;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;
    
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100); // slight delay lets rendering settle
  }

  

}
