import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exam-result-dialog',
  imports: [],
  templateUrl: './exam-result-dialog.component.html',
  styleUrl: './exam-result-dialog.component.css'
})
export class ExamResultDialogComponent {
  mode:string;
  score:number;
  total:number;

  constructor(
    public dialogRef:MatDialogRef<ExamResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      mode:string,
      score:number,
      total:number
    }
  ){
    this.mode = data.mode
    this.score = data.score,
    this.total = data.total
  }
}
