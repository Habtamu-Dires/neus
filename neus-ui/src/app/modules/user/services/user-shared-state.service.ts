import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, single } from 'rxjs';
import { ResourceInfoDto, SubPlanDto, SubscriptionDto } from '../../../services/models';

@Injectable({
  providedIn: 'root'
})
export class UserSharedStateService {

  readonly subscriptionLevel = signal<'NONE' | 'BASIC' | 'ADVANCED' | 'PREMIUM' | undefined >(undefined);
  readonly currentSubLevelCat = signal<'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM'>('FREE');
  readonly resourceList = signal<ResourceInfoDto[]>([]);
  readonly subPlans = signal<SubPlanDto[]>([]);
  readonly userSubscription = signal<SubscriptionDto | undefined>(undefined);

  constructor() { }

  // update subscription level
  updateSubscriptionLevel(level: 'NONE' | 'BASIC' | 'ADVANCED' | 'PREMIUM' | undefined) {
    this.subscriptionLevel.set(level);
  }

  // update current sub level category
  updateCurrentSubLevelCat(level: 'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM'){
    this.currentSubLevelCat.set(level);
  }

  // update resouces list
  updateResourcesList(resourceList:ResourceInfoDto[]){
    this.resourceList.set(resourceList);
  }

  // update subplans
  updateSubPlans(subPlans:SubPlanDto[]){
    this.subPlans.set(subPlans);
  }

  // update user subscription
  updateUserSubscription(subscription:SubscriptionDto){
    this.userSubscription.set(subscription);
  }
  
}
