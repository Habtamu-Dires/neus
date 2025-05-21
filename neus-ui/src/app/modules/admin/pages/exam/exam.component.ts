import { Component, HostListener, OnInit } from '@angular/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { HeaderComponent } from "../../components/header/header.component";
import { ToastrService } from 'ngx-toastr';
import { ExamDto, UserDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadDialogComponent } from '../../components/read-dialog/read-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ExamsService } from '../../../../services/services';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { intervalToDuration } from 'date-fns';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';

@Component({
  selector: 'app-exam',
  imports: [PaginationComponent, HeaderComponent, CommonModule, FormsModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit{

  examList:ExamDto[] = [];
  selectedExamId:string = '';
  showActions:boolean = false;
  isLoading:boolean = true;
  // pagination
  page:number = 0;
  size:number = 10;
  isEmptyPage: boolean = true;
  isFirstPage: boolean |undefined; 
  isLastPage: boolean |undefined;
  totalPages: number | undefined;
  totalElements: number | undefined;
  numberOfElements: number | undefined;
  //filter
  titleFilter:string | undefined;
  typeFilter:string | undefined;
  subLevelFilter:string | undefined;
  yearFilter:number | undefined;

  constructor(
    private examsService:ExamsService,
    private router:Router,
    private toastrService:ToastrService,
    private matDialog:MatDialog,
    private adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.page = this.adminUxService.examPageNo();
    this.fetchPageOfExams();
  }

  // fetch page of exams
  fetchPageOfExams(){
    this.examsService.getPageOfExams({
        page: this.page,
        size: this.size
      }).subscribe({
      next:(res)=>{
        this.examList = res.content as ExamDto[];
        this.isLoading = false;
        // pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
        // update page no
        this.adminUxService.updateExamPageNo(this.page);
      },
      error:(err)=>{
        this.isLoading = false;
        console.log(err);
        this.toastrService.error(err);
      }
    })
  }

  // filter exam
  filterExam(){
    this.examsService.filterExams({
      'title': this.titleFilter,
      'type': this.typeFilter,
      'requiredSubLevel': this.subLevelFilter,
      'year': this.yearFilter
    }).subscribe({
      next:(res)=>{
        this.examList = res.content as ExamDto[];
        // pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // on read dialog
  readDescription(description:any, title:any){
    const dialog = this.matDialog.open(ReadDialogComponent,{
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '60%',
      height: '60%',
          data:{
            content:description,
            title: title
          }
    });

    dialog.afterClosed().subscribe((result) => {
      if(result){
        console.log('user status toggled');
      }
    });
  
  }

  // on view question
  viewQuestions(exam:ExamDto){
    this.router.navigate(['admin','questions'],
      {queryParams:{
        'examId':exam.id,
        'title': exam.title,
        'examType': exam.examType
      }})
  }

  // on show actions
  onShowActions(examId:any){
    this.showActions = !this.showActions;
    this.selectedExamId = examId;
  }

  // on edit
  onEdit(examId:any){
    this.router.navigate(['admin','exams','manage', examId]);
  }

  // on create new
  onCreateNew(){
    this.router.navigate(['admin/exams/manage']);
  }

  // on delete
  onDelete(examId:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
          width: '400px',
          data:{
            message:'you wants to delete this exam',
            buttonName: 'Delete',
            isWarning: true
          }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.deleteExam(examId)
      }
    });
  }

  // delete exam
  deleteExam(examId:any){
    this.examsService.deleteExam({
      'exam-id': examId
    }).subscribe({
      next:()=>{
        this.toastrService.success('Exam deleted successfully', 'Done');
        this.fetchPageOfExams();
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Error deleting the exam', 'Error');
      }
    })
  }

  // on search 
  onSearch(text:any){
    if(text.length >= 3){
      this.titleFilter = text;
      this.filterExam();
    } else {
      this.fetchPageOfExams();
    }
  }
  
  // on type filter
  onTypeFilter(type:string){
    if(type.length > 0){
      this.typeFilter = type;
      this.filterExam();
    } else {
      this.fetchPageOfExams();
    }
  }
  // on required sub level filter
  onSubLevelFilter(level:string){
    if(level.length > 0){
        this.subLevelFilter = level;
        this.filterExam();
    } else {
      this.fetchPageOfExams();
    }
  }

  // on year filter
  onYearFilter(year:number){
    if(year){
      this.yearFilter = year;
      this.filterExam();
    } else {
      this.fetchPageOfExams();
    }
  }


  // pagination
  onSizeChanged(size:number){
    this.size=size;
    this.fetchPageOfExams();
  }

  onPageChanged(page:number){
    this.page=page;
    this.fetchPageOfExams();
  }

  // hide delete & edit btn onclick outside the btn
  @HostListener('document:click', ['$event'])
  hideDeleteBtn(event: MouseEvent){
    const target = event.target as HTMLElement;
    if(!target.classList.contains('donthide')){
      this.showActions = false;
    }
  }

  formatMinutesToDuration(minutes: any): string {
    const duration = intervalToDuration({ start: 0, end: minutes as number * 60 * 1000 });
    const parts = [];
    if (duration.hours) parts.push(`${duration.hours} hour${duration.hours > 1 ? 's' : ''}`);
    if (duration.minutes) parts.push(`${duration.minutes} minute${duration.minutes > 1 ? 's' : ''}`);
    return parts.join(' ') || '0 minutes';
  }
  

}
