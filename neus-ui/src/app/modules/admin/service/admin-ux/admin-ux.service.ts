import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdminUxService {

  //shaw drawer status
  readonly showDrawer = signal<boolean>(false);
  readonly resourcePageNo = signal<number>(0);
  readonly userPageNo = signal<number>(0);
  readonly examPageNo = signal<number>(0);

  constructor() { }

  // update show drawer
  toggleShowDrawerStatus(){
    this.showDrawer.set(!this.showDrawer());
  }

  // update resource PageNo 
  updateResourcePageNo(page:number){
    this.resourcePageNo.set(page);
  }

  // update exam Page no
  updateExamPageNo(page:number){
    this.examPageNo.set(page);
  }

  // update userPage number 
  updateUserPageNo(page:number){
    this.userPageNo.set(page);
  }

  


}
