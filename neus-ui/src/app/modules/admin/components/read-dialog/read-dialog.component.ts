import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-read-dialog',
  imports: [],
  templateUrl: './read-dialog.component.html',
  styleUrl: './read-dialog.component.css'
})
export class ReadDialogComponent {
  title:string;
  content:string;

  constructor(
    public dialogRef:MatDialogRef<ReadDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title:string,
      content:string
    }
  ){
    this.content = data.content;
    this.title = data.title;
  }

  close(){
    this.dialogRef.close();
  }


} 
