import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { QuillModule } from 'ngx-quill';
import { QuestionsService } from '../../../../services/services';
import { TextDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment.development';
import BlotFormatter2 from '@enzedonline/quill-blot-formatter2';
import Quill from 'quill';
import { ToastrService } from 'ngx-toastr';

Quill.register('modules/blotFormatter2', BlotFormatter2);

@Component({
  selector: 'app-edit-dialog',
  imports: [FormsModule,CommonModule,QuillModule],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.css'
})
export class EditDialogComponent {
  id:string;
  title: string;
  content: string;
  imageUrls:string[] = [];
  quillEditorInstance: any; // To hold the Quill editor instance
  isUploading: boolean = false; // For the upload animation
  imageUploadUrl:string = `${environment.apiUrl}/questions/upload-image`;

  quillConfig = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        [{ 'direction': 'rtl' }],                         // text direction

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

        [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        [{ 'font': [] }],
        [{ 'align': [] }],

        ['clean'],                                         // remove formatting button

        ['link', 'image', 'video']   
      ],
      handlers: {
        image: this.imageHandler.bind(this)
      }
    },
    // Add the image resize module configuration
    blotFormatter2: {
      delete: {
        allowKeyboardDelete: true
      },
    }
  };

  constructor(
    private http:HttpClient,
    private toastrService:ToastrService,
    public dialogRef: MatDialogRef<EditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      id: string,
      title: string;
      content: string,
    }
  ) {
    this.id = data.id;
    this.content = data.content || '';
    this.title = data.title;
  }

  // Get the Quill editor instance
  onEditorCreated(quill: any) {
    this.quillEditorInstance = quill;
  }


  // handle image upload
  imageHandler(image: any) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files![0];
      if (file) {
        this.uploadImage(file);
      }
    };
  }

  // upload image
  uploadImage(file: any) {
    this.isUploading = true; // Show the loading animation
    const formData = new FormData();
    formData.append('file', file); // Ensure the field name matches your Spring Boot controller

    this.http.post<TextDto>(`${environment.apiUrl}/questions/upload-image`, formData) // Adjust your API endpoint
      .subscribe({
        next: (res: TextDto) => {
          this.isUploading = false; // Hide the loading animation
          const imageUrl = res.value;
          console.log("image url " + imageUrl);
          if(imageUrl){
            const range = this.quillEditorInstance.getSelection();
            if (range) {
              this.quillEditorInstance.insertEmbed(range.index, 'image', imageUrl);
            } else {
              this.quillEditorInstance.insertEmbed(this.quillEditorInstance.getLength(), 'image', imageUrl);
            }
            this.imageUrls.push(imageUrl);
            console.log("imager url " + this.imageUrls);
          }
        },
        error: (err) => {
          this.isUploading = false; // Hide loading animation even on error
          console.error('Image upload failed:', err);
           this.toastrService.error('Image upload failed', 'Error');
        }
      });
  }

  onContentChanged(event: any) {
    console.log('Content changed:', event.html);
    this.content = event.html;
    // console.log('Current content in component:', this.content);
  }

  // submit
  submit() {
    console.log("imageUrl " + this.imageUrls);
    this.dialogRef.close({
      content: this.content,
      imageUrls: this.imageUrls
    });
  }

  // close
  close() {
    this.dialogRef.close();
  }
}
