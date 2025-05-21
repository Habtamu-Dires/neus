import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview',
  imports: [],
  templateUrl: './image-preview.component.html',
  styleUrl: './image-preview.component.css',
  // template: `<img [src]="data.url" alt="Image Preview" style="max-width: 100%; max-height: 100%;">`
})
export class ImagePreviewComponent {

  constructor(
   public dialogRef:MatDialogRef<ImagePreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {}

  onCancel(){
    this.dialogRef.close(true);
  }
}
