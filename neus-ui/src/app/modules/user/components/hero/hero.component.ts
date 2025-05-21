import { Component, effect, EventEmitter, Output } from '@angular/core';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { UserSharedStateService } from '../../services/user-shared-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  isLoggedIn = false;
  username: string | null = null;
  headline = 'Ace Your Medical Exams with Ease';
  subtext = 'Practice with exams, videos, and notes designed for medical students.';
  ctaText = 'Explore Resources';
  ctaLink = '/resources';

  paragraphs = [
    '1,200+ ERMP Questions with answers and detailed UWorld-format Explanations',
    '600+ Licensure Exam (Medical COC) Questions, with answers and detailed UWorld format explanations',
    '1100+ NGAT Questions, with answers and detailed explanations',
    '8000+ UWorld Questions for Step 1 & Step 2 with detailed explanation from UWorld 2025',
    'Access to Medical Books, Guidelines, Pathoma & Beyond'
  ];
  isVisible: boolean[] = [];

  @Output() navigateToAction = new EventEmitter<string>();

  constructor(
    private keycloakService: KeycloakService,
    public userSharedStateService: UserSharedStateService
  ) {

    // Check login status
    this.isLoggedIn = this.keycloakService.isAuthenticated;

    if (this.isLoggedIn) {
      // Fetch user profile
      this.username = this.keycloakService.profile.username;
      const subscriptionLevel = this.userSharedStateService.subscriptionLevel();

      this.updateContent(subscriptionLevel);
      // call 
      effect(()=>{
        const subscriptionLevel = this.userSharedStateService.subscriptionLevel();
        this.updateContent(subscriptionLevel);
      })
    }
  }

  ngOnInit(): void {
    this.isVisible = this.paragraphs.map(() => false);
    // Trigger the visibility change after a short delay to ensure initial render
    setTimeout(() => {
      this.isVisible = this.paragraphs.map(() => true);
    }, 50);
  }

  private updateContent(subscriptionLevel:string | undefined): void {
      if (subscriptionLevel) {
        // Subscribed user
        this.headline = `Welcome Back! 👋`;
        this.subtext = `Dive into your ${subscriptionLevel} resources.`;
        this.ctaText = 'View My Resources';
        this.ctaLink = '/resources';
      } else {
        // Logged-in, no subscription
        this.headline = `Welcome 🖐`;
        this.subtext = 'Choose a plan to unlock exams, videos, and notes.';
        this.ctaText = 'Choose a Plan';
        this.ctaLink = '/subscriptions';
      }
    // Default (guest) content is already set
  }

  // go to resources
  gotoAction(){
    if(this.isLoggedIn){
      if(!this.userSharedStateService.subscriptionLevel()){
        this.navigateToAction.emit('plan');
      } else {
        this.navigateToAction.emit('resources');
      }
    } else {
      this.navigateToAction.emit('resources');
    }
  } 
}
