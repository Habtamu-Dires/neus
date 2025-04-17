import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateExamDto } from '../../../../services/models';
import { ExamsService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';
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
    duration: 0
  }
  errMsgs:Array<string> = [];
  showSubscriptionLevelList:boolean = false;
  subscriptionLevelList:Array<string> = ['NONE','BASIC','ADVANCED','PREMIUM'];

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
          department:res.department,
          requiredSubLevel: res.requiredSubLevel as "BASIC" |  "ADVANCED" | "PREMIUM",
          description: res.description,
          duration: res.duration as number
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

  
  onCancel(){
    this.router.navigate(['/admin/exams']);
  }
}
