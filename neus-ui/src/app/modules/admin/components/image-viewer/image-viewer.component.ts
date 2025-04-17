import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-viewer',
  imports: [],
  templateUrl: './image-viewer.component.html',
  styleUrl: './image-viewer.component.css'
})
export class ImageViewerComponent {
  imageUrl:string = '';

  constructor(
     private imageViewerRef:MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { imageUrl: string }
  ){
    this.imageUrl = data.imageUrl;
  }

  closeDialog(){
    this.imageViewerRef.close();
  }
}
