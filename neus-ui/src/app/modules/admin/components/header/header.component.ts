import { Component, effect, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, throttleTime } from 'rxjs';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';
import { SharedStateService } from '../../../../services/shared-state/shared-state.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPrintModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input() componentName: string = '';
  @Input() printSectionId: string = '';
  @Input() hasCreateNewButton: boolean = true;
  @Output() onCreateNewCliked = new EventEmitter<{}>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() filter = new EventEmitter<string>();
  @Output() resTypeFilter = new EventEmitter<string>();
  @Output() examTypeFilter = new EventEmitter<string>();
  @Output() subLevelFilter = new EventEmitter<string>();
  @Output() afterDateTime = new EventEmitter<string>();
  @Output() yearFilter = new EventEmitter<number>();

  showDrawer:boolean = true;
  showEkubs:boolean = false;
  dateTime:string | undefined;

  searchControl= new FormControl();
  ekubSearchControl = new FormControl();

  // fill
  resourceTypeList:string[] = [];
  examTypeList:string[] = [];
  subLevelList:string[] = ['NONE', 'BASIC', 'ADVANCED','PREMIUM'];
  yearList:number[] = [2025,2024,2023,2022,2021,2020,2019];

  constructor(
    private adminUxService:AdminUxService,
    private sharedStateService:SharedStateService
  ){
    effect(()=>{
      this.showDrawer = this.adminUxService.showDrawer();
    })
  }

  ngOnInit(): void {
    this.searchFormControl();
    //fill
    this.resourceTypeList = this.sharedStateService.resouceTypeList;
    this.examTypeList = this.sharedStateService.examTypeList;
  }


  // toogle showdrawer
  toggleShowDrawer(){
    this.adminUxService.toggleShowDrawerStatus();
  }

  onCreateNew() {
    this.onCreateNewCliked.emit();
  }

  // search form control
  searchFormControl(){
    this.searchControl.valueChanges
    .pipe(
      debounceTime(300),
      throttleTime(1000)
    ).subscribe((value:any) =>{
       const text = value as string;
       this.onSearch.emit(text);
    })
  }

  // on type selected
  onResTypeSelected(type:string){
      this.resTypeFilter.emit(type);
  }

  // on exam type selected
  onExamTypeSelected(type:string){
    this.examTypeFilter.emit(type);
  }

  // on sub level selected
  onSubLevelSelected(level:string){
    this.subLevelFilter.emit(level);
  }

  onYearSelected(year:number){
    this.yearFilter.emit(year);
  }

  // clear search area
  clearSearchArea() {
    this.searchControl.setValue('');
    this.onSearch.emit('');
  }

  //on filter changed
  onFilterChanged(value:any){
    this.filter.emit(value as string);
  }

  // on date change
  onDateTimeChange(){
    this.afterDateTime.emit(this.dateTime);
  }

  // print page
  printPage(){
    window.print();
  }

}
