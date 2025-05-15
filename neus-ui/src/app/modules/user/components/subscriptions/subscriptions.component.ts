import { Component } from '@angular/core';
import { KeycloakService } from '../../../../services/keycloak/keycloak.service';
import { SbuPlansService, SubscriptionService } from '../../../../services/services';
import { SubPlanDto, SubscriptionDto } from '../../../../services/models';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { UserSharedStateService } from '../../services/user-shared-state.service';

@Component({
  selector: 'app-subscriptions',
  imports: [FormsModule,CommonModule],
  providers:[DatePipe],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export class SubscriptionsComponent {
  plans: SubPlanDto[] = [];
  isLoggedIn = false;
  // subscriptionLevel: string | undefined;
  userId: string | undefined;
  subscriptionDto: SubscriptionDto | undefined;

  constructor(
    private keycloakService: KeycloakService,
    private subscriptionService: SubscriptionService,
    private datePipe:DatePipe,
    private subPlanService:SbuPlansService,
    private toastrService:ToastrService,
    public userSharedStateService:UserSharedStateService
  ) {}

  ngOnInit(): void {
    // fetch plans
    this.fetchSubPlans();
    // Check login status
    this.isLoggedIn = this.keycloakService.isAuthenticated;
    if (this.isLoggedIn) {
      this.userId = this.keycloakService.profile.id;
      const subscriptionLevel = this.userSharedStateService.subscriptionLevel();
      if(subscriptionLevel){
        // fetch user subscription details
        this.fetchUserSubDetail();
      }
    }
  }

  //fetch subscription plan
  fetchSubPlans(){
    this.subPlanService.getEnabledSubPlans().subscribe({
      next:(res)=>{
        this.plans = res;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // fetch user subscription
  fetchUserSubDetail(){
    this.subscriptionService.getUserSubscription({
      'user-id':this.keycloakService.profile.id
    }).subscribe({
      next:(res)=>{
        this.subscriptionDto = res;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // handle subscribe
  handleSubscribe(plan: any): void {
    if (!this.isLoggedIn) {
      this.keycloakService.login();
      return;
    }
    if (this.userSharedStateService.subscriptionLevel() === plan.level) {
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
      next:(res)=>{
        this.userSharedStateService.updateSubscriptionLevel(res.level);
        this.subscriptionDto = res;
        this.toastrService.success('Plan upgraded sucessfully', 'Done');
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Something went wrong', 'Error');
      }
    })
  }

  // is current plan
  isCurrentPlan(level: any): boolean {
    return this.isLoggedIn && this.userSharedStateService.subscriptionLevel() === level;
  }

  // get button text
  getButtonText(level: any): string {
    if (!this.isLoggedIn) return 'Subscribe';
    if (this.userSharedStateService.subscriptionLevel() === level) return 'Your Plan';
    if (this.isHigherTier(level)) return 'Upgrade';
    return 'Downgrade';
  }

  // is higher tier
  private isHigherTier(level: string): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const currentLevel = this.userSharedStateService.subscriptionLevel();
    const currentIndex = currentLevel ? tiers.indexOf(currentLevel) : -1;
    const targetIndex = tiers.indexOf(level);
    return targetIndex > currentIndex;
  }

  // is lower tier
  public isLowerTier(level: any): boolean {
    const tiers = ['BASIC', 'ADVANCED', 'PREMIUM'];
    const currentLevel = this.userSharedStateService.subscriptionLevel();
    const currentIndex = currentLevel ? tiers.indexOf(currentLevel) : -1;
    const targetIndex = tiers.indexOf(level as string);
    return targetIndex < currentIndex;
  }

  // convert date format 
  formatDate(dateTime:any){
    if(dateTime){
      const date = new Date(dateTime as string);
      return this.datePipe.transform(date, 'MMM dd, yyyy');
    }
    return '';
  }
}
