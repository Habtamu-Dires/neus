import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-resume-exam-dialog',
  imports: [CommonModule],
  providers: [DatePipe],
  templateUrl: './resume-exam-dialog.component.html',
  styleUrl: './resume-exam-dialog.component.css'
})
export class ResumeExamDialogComponent {
  answeredCount:number;
  mode:string;
  total:number;
  lastUpdatedDate:string;
  timeLeft:number;

  constructor(
    private datePipe: DatePipe,
    public dialogRef:MatDialogRef<ResumeExamDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      answeredCount:number,
      mode:string,
      total:number,
      lastUpdatedDate:string,
      timeLeft:number
    }
  ){
    this.answeredCount = data.answeredCount
    this.mode = data.mode,
    this.total = data.total
    this.lastUpdatedDate = data.lastUpdatedDate
    this.timeLeft = data.timeLeft
  }

  onConfirm(){
    this.dialogRef.close(true);
  }

  onCancel(){
    this.dialogRef.close(false);
  }

  //format date time
  //formatted date time
  formattedDateTime(dateTime:any){
    if(dateTime){
      const date = new Date(dateTime as string);
      return this.datePipe.transform(date, 'MMM dd, yy hh:mm a');
    }
    return '';
  }
}
