import { CommonModule } from '@angular/common';
import { Component, ElementRef, Host, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateExamDto } from '../../../../services/models';
import { ExamsService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-manage-exam',
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-exam.component.html',
  styleUrl: './manage-exam.component.css'
})
export class ManageExamComponent implements OnInit{

  createExamDto:CreateExamDto = {
    requiredSubLevel: 'NONE',
    examType: 'TEST',
    duration: 0,
    year: 0
  }
  errMsgs:Array<string> = [];
  showSubscriptionLevelList:boolean = false;
  subscriptionLevelList:Array<string> = ['NONE','BASIC','ADVANCED','PREMIUM'];
  exampTeypeList:Array<string> = ["TEST","ERMP", "USMLE_STEP_1","USMLE_STEP_2"]
  showExamTypeList:boolean = false;

  @ViewChild('subListElement') subListElement!:ElementRef;
  @ViewChild('typeListElement') typeListElement!:ElementRef;


  constructor(
    private examsService:ExamsService,
    private activatedRoute:ActivatedRoute,
    private toastrService:ToastrService,
    private router:Router,
    private matDialog:MatDialog
  ){}

  ngOnInit(): void {
    const examId = this.activatedRoute.snapshot.params['examId'];
    if(examId){
      this.fetchExamById(examId);
    }
  }

  // create exam 
  createNewExam(){
    this.examsService.createExam({
      body: this.createExamDto
    }).subscribe({
      next:()=>{
        this.toastrService.success('Exam created successfully', 'Done');
        this.router.navigate(['/admin/exams']);
      },
      error:(err) => {
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        }else {
          this.toastrService.error('Something went wrong', 'Error');
        }
      }
    })
  }

  // fetch exams by id
  fetchExamById(examId:string){
    this.examsService.getExamById({
      'exam-id': examId
    }).subscribe({
      next:(res)=>{
        this.createExamDto = {
          id:res.id,
          title: res.title,
          year: res.year as number,
          examType: res.examType as "ERMP" | "USMLE_STEP_1" | "USMLE_STEP_2",
          requiredSubLevel: res.requiredSubLevel as "BASIC" |  "ADVANCED" | "PREMIUM",
          description: res.description,
          duration: res.duration as number,
          randomQuestionCount: res.randomQuestionCount
        }
      },
      error:(err) =>{
        console.log(err);
        this.toastrService.error('Something went wrong', 'Error');
      }
    })
  }

  // update exam
  updateExam(){
    this.examsService.updateExam({
      body: this.createExamDto
    }).subscribe({
      next:()=>{
        this.toastrService.success('Exam updated successfully', 'Done');
        this.router.navigate(['/admin/exams']);
      },
      error:(err) => {
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        }else {
          this.toastrService.error('Something went wrong', 'Error');
        }
      }
    })
  }

  onSave(){
    if(this.createExamDto.id){

      this.updateExam();
    } else {
      this.createNewExam();
    }
  }

  // on sub level selected
  onSubscriptionLevelSelected(level:any){
    this.createExamDto.requiredSubLevel = level;
    this.showSubscriptionLevelList = false;
  }

  // on exam type selected
  onExamTypeSelected(type:any){
    this.createExamDto.examType = type;
    this.showExamTypeList = false;
  }

  
  onCancel(){
    this.router.navigate(['/admin/exams']);
  }

  // on click listener
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (this.showSubscriptionLevelList && this.subListElement && !this.subListElement.nativeElement.contains(target)) {
      this.showSubscriptionLevelList = false;
    }
    if (this.showExamTypeList && this.typeListElement && !this.typeListElement.nativeElement.contains(target)) {
      this.showExamTypeList = false;
    }
  }
}
