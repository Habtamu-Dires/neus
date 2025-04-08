import { Component, EventEmitter, Input, Output } from '@angular/core';
import { debounceTime, throttleTime } from 'rxjs';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';

@Component({
  selector: 'app-header',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,NgxPrintModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  @Input() componentName: string = '';
  @Input() printSectionId: string = '';
  @Output() onCreateNewCliked = new EventEmitter<{}>();
  @Output() onSearch = new EventEmitter<string>();
  @Output() filter = new EventEmitter<string>();
  @Output() afterDateTime = new EventEmitter<string>();

  showEkubs:boolean = false;
  dateTime:string | undefined;
  onShowDrawer:boolean = false;

  searchControl= new FormControl();
  ekubSearchControl = new FormControl();

  constructor(
    private adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.searchFormControl();
    // on show drawer status
    this.adminUxService.showDrawer$.subscribe((onShowDrawer:boolean)=>{
      this.onShowDrawer = onShowDrawer;
    });
  }

  // update showDrawer status
  updateShowDrawerStatus(){
    this.adminUxService.updateShowDrawerStatus(this.onShowDrawer);
  }

  // toogle showdrawer
  toggleShowDrawer(){
    this.onShowDrawer = !this.onShowDrawer;
    this.updateShowDrawerStatus();
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
