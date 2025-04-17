import { Component } from '@angular/core';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { Router } from '@angular/router';
import { SbuPlansService, SubscriptionService } from '../../../../services/services';
import { SubPlanDto } from '../../../../services/models';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-subscriptions',
  imports: [FormsModule,CommonModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent {
  plans: SubPlanDto[] = [];
  isLoggedIn = false;
  subscriptionLevel: string | null = null;

  constructor(
    private keycloakService: KeycloakService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private subPlanService:SbuPlansService,
    private toastrService:ToastrService
  ) {}

  ngOnInit(): void {
    // Check login status
    this.isLoggedIn = this.keycloakService.isAuthenticated;
    if (this.isLoggedIn) {
      const subscriptionType = this.keycloakService.subscriptionLevel as string;
      if(subscriptionType){
        this.subscriptionLevel = subscriptionType.replace('_subscriber','').toUpperCase();
      }
    }
    // // Fetch plans
    this.fetchSubPlans();
  }

  //fetch subscription plan
  fetchSubPlans(){
    this.subPlanService.getEnabledSubPlans().subscribe({
      next:(res)=>{
        this.plans = res;
        console.log("plans : == >" +  res)
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  handleSubscribe(plan: any): void {
    if (!this.isLoggedIn) {
      this.keycloakService.login();
      return;
    }
    if (this.subscriptionLevel === plan.level) {
      return; // Already subscribed to this plan
    }
    // subscribe
    this.createSubscription(plan.id)
  }

  // subscribe
  createSubscription(subPlanId:string){
    this.subscriptionService.createSubscription({
      'sub-plan-id': subPlanId
    }).subscribe({
      next:()=>{
        this.fetchSubPlans();
        this.toastrService.success('Plan upgraded sucessfully', 'Done');
        this.keycloakService.refreshToken();
        
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Something went wrong', 'Error');
      }
    })
  }

  isCurrentPlan(level: any): boolean {
    return this.isLoggedIn && this.subscriptionLevel === level;
  }

  getButtonText(level: any): string {
    if (!this.isLoggedIn) return 'Subscribe';
    if (this.subscriptionLevel === level) return 'Your Plan';
    if (this.isHigherTier(level)) return 'Upgrade';
    return 'Downgrade';
  }

  private isHigherTier(level: string): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const currentIndex = this.subscriptionLevel ? tiers.indexOf(this.subscriptionLevel) : -1;
    const targetIndex = tiers.indexOf(level);
    return targetIndex > currentIndex;
  }

  public isLowerTier(level: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const currentIndex = this.subscriptionLevel ? tiers.indexOf(this.subscriptionLevel) : -1;
    const targetIndex = tiers.indexOf(level as string);
    return targetIndex < currentIndex;
  }
}
