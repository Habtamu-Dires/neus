import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuillModule } from 'ngx-quill';


@Component({
  selector: 'app-edit-dialog',
  imports: [FormsModule,QuillModule],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.css'
})
export class EditDialogComponent {
  title: string;
  content: string;

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'], // Basic formatting
      [{ size: ['small', 'normal', 'large', 'huge'] }], // Size dropdown
    ],
  };

  constructor(
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; content: string }
  ) {
    this.content = data.content || '';
    this.title = data.title;
  }

  submit() {
    this.dialogRef.close({
      content: this.content,
    });
  }

  close() {
    this.dialogRef.close();
  }
}
