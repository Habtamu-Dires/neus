import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSharedStateService {

  readonly subscriptionLevel = signal<'NONE' | 'BASIC' | 'ADVANCED' | 'PREMIUM' | undefined >(undefined);
  readonly currentSubLevelCat = signal<'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM'>('FREE');

  constructor() { }

  // update subscription level
  updateSubscriptionLevel(level: 'NONE' | 'BASIC' | 'ADVANCED' | 'PREMIUM' | undefined) {
    this.subscriptionLevel.set(level);
  }

  // update current sub level category
  updateCurrentSubLevelCat(level: 'FREE' | 'BASIC' | 'ADVANCED' | 'PREMIUM'){
    this.currentSubLevelCat.set(level);
  }
  
}
