import { Component, EventEmitter, output, Output } from '@angular/core';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  isLoggedIn = false;
  username: string | null = null;
  subscriptionLevel: string | null = null;
  headline = 'Ace Your Medical Exams with Ease';
  subtext = 'Practice with exams, videos, and notes designed for medical students.';
  ctaText = 'Explore Resources';
  ctaLink = '/resources';

  @Output() navigateToAction = new EventEmitter<string>();

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    // Check login status
    this.isLoggedIn = this.keycloakService.isAuthenticated;

    if (this.isLoggedIn) {
      // Fetch user profile
      this.username = this.keycloakService.profile.username;

      // Fetch subscription
      const subscriptionType = this.keycloakService.subscriptionLevel as string;
      if(subscriptionType){
        this.subscriptionLevel = subscriptionType.replace('_subscriber','').toUpperCase();
      }
      this.updateContent();
    }
  }

  private updateContent(): void {
    if (this.isLoggedIn) {
      if (this.subscriptionLevel) {
        // Subscribed user
        this.headline = `Welcome Back! ${this.username}`;
        this.subtext = `Dive into your ${this.subscriptionLevel} resources.`;
        this.ctaText = 'View My Resources';
        this.ctaLink = '/resources';
      } else {
        // Logged-in, no subscription
        this.headline = 'Start Your Exam Prep Journey';
        this.subtext = 'Choose a plan to unlock exams, videos, and notes.';
        this.ctaText = 'Choose a Plan';
        this.ctaLink = '/subscriptions';
      }
    }
    // Default (guest) content is already set
  }

  // go to resources
  gotoAction(){
    if(this.isLoggedIn){
      if(!this.subscriptionLevel){
        this.navigateToAction.emit('plan');
      } else {
        this.navigateToAction.emit('resources');
      }
    } else {
      this.navigateToAction.emit('resources');
    }
  } 
}
