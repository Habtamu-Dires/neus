import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from "../components/header/header.component";
import { CommonModule } from '@angular/common';
import { HeroComponent } from "../components/hero/hero.component";
import { ResourcesComponent } from "../components/resources/resources.component";
import { FooterComponent } from "../components/footer/footer.component";
import { SubscriptionPlanComponent } from "../../admin/pages/subscription-plan/subscription-plan.component";
import { SubscriptionsComponent } from "../components/subscriptions/subscriptions.component";

@Component({
  selector: 'app-home',
  imports: [HeaderComponent, CommonModule, HeroComponent, ResourcesComponent, FooterComponent, SubscriptionsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  selectedSection:string = 'Home';
  drawerShown:boolean = false;

  constructor() {}

  ngOnInit(): void {
    this.scrollToSection('home');
  }

  onSectionSelected(section:any){
    this.selectedSection = section;
    this.scrollToSection(section.toLocaleLowerCase());
  }

  onShawDrawer(showDrawer:any){
    this.drawerShown = showDrawer;
  }

  scrollToSection(sectionId: string) {
    console.log("scrollToSection", sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      console.log("is element")
      const headerOffset = 50;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  

}
