import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-video-preview',
  imports: [],
  templateUrl: './video-preview.component.html',
  styleUrl: './video-preview.component.css',
  // template: `<video controls [src]="data.url" style="max-width: 100%; max-height: 100%;"></video>`
})
export class VideoPreviewComponent {
  constructor( public dialogRef:MatDialogRef<VideoPreviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { url: string }
  ) {}

  onCancel(){
    this.dialogRef.close(true);
  }
}
