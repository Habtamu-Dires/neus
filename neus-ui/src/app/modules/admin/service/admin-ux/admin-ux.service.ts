import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminUxService {

  
  //shaw drawer status
  showDrawerSubjec = new BehaviorSubject<boolean>(false);
  showDrawer$ = this.showDrawerSubjec.asObservable();

  constructor() { }


  // update show drawer
  updateShowDrawerStatus(value:boolean){
    this.showDrawerSubjec.next(value);
  }
}
