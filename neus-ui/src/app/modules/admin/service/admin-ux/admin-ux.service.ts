import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminUxService {

  //shaw drawer status
  readonly showDrawer = signal(false);

  constructor() { }

  // update show drawer
  toggleShowDrawerStatus(){
    this.showDrawer.set(!this.showDrawer());
  }


}
