import { Component, HostListener, OnInit } from '@angular/core';
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { HeaderComponent } from "../../components/header/header.component";
import { ToastrService } from 'ngx-toastr';
import { ExamDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReadDialogComponent } from '../../components/read-dialog/read-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ExamsService } from '../../../../services/services';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { intervalToDuration } from 'date-fns';

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
  // pagination
  page:number = 0;
  size:number = 5;
  isEmptyPage: boolean = true;
  isFirstPage: boolean |undefined; 
  isLastPage: boolean |undefined;
  totalPages: number | undefined;
  totalElements: number | undefined;
  numberOfElements: number | undefined;

  constructor(
    private examsService:ExamsService,
    private router:Router,
    private toastrService:ToastrService,
    private matDialog:MatDialog
  ){}

  ngOnInit(): void {
    this.fetchPageOfExams();
  }

  // fetch page of exams
  fetchPageOfExams(){
    this.examsService.getPageOfExams().subscribe({
      next:(response)=>{
        this.examList = response.content as ExamDto[];
        // pagination
        this.isFirstPage = response.first;
        this.isLastPage = response.last;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.numberOfElements = response.numberOfElements;
        this.isEmptyPage = response.empty as boolean;
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
  viewQuestions(examId:any, title:any){
    this.router.navigate(['admin','questions', examId, title])
  }

  // on search 
  onSearch(text:any){}


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
