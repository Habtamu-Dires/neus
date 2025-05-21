import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
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
import { FirefoxQuillViewPatchDirective } from '../../../../firefox-quill-view-patch.directive';

Quill.register('modules/blotFormatter2', BlotFormatter2);

@Component({
  selector: 'app-edit-dialog',
  imports: [FormsModule,CommonModule,QuillModule,FirefoxQuillViewPatchDirective],
  templateUrl: './edit-dialog.component.html',
  styleUrl: './edit-dialog.component.css'
})
export class EditDialogComponent {
  id:string;
  title: string;
  content: string;
  mediaUrls:string[] = [];
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

        ['link', 'image']    // 'video'
      ],
      handlers: {
        image: this.imageHandler.bind(this),
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
    console.log("the content to editor " + data.content);
  }


  // Get the Quill editor instance
  onEditorCreated(quill: any) {
    this.quillEditorInstance = quill;
  }

  
  // handle image upload
  imageHandler() {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files![0];
      if (file) {
        this.uploadMedia(file);
      }
    };
  }

  // upload image
  uploadMedia(file: any) {
    this.isUploading = true; // Show the loading animation
    const formData = new FormData();
    formData.append('file', file); 

    this.http.post<TextDto>(`${environment.apiUrl}/questions/upload-media`, formData) 
      .subscribe({
        next: (res: TextDto) => {
          this.isUploading = false; // Hide the loading animation
          const mediaUrl = res.value;
          if(mediaUrl){
            const range = this.quillEditorInstance.getSelection();
            if (range) {
              this.quillEditorInstance.insertEmbed(range.index, 'image', mediaUrl);
            } else {
              this.quillEditorInstance.insertEmbed(this.quillEditorInstance.getLength(), 'image', mediaUrl);
            }
            // push to image urls list
            this.mediaUrls.push(mediaUrl);
            this.toastrService.success('Image uploaded Sucessfully');

          }
        },
        error: (err) => {
          this.isUploading = false; // Hide loading animation even on error
          console.error('Image upload failed:', err);
          this.toastrService.error('Image upload failed', 'Error');
        }
      });
  }

  // on content change listener of quill editor
  onContentChanged(event: any) {
    this.content = event.html;
  }

  // submit
  submit() {
    this.dialogRef.close({
      content: this.content,
      mediaUrls: this.mediaUrls
    });
  }

  // close
  close() {
    this.dialogRef.close();
  }
}



// Use setTimeout to delay the patch, allowing the DOM to fully render the wrappers and images


//   setTimeout(() => {

  //   if (navigator.userAgent.includes('Firefox')) {
  //     // console.log('Detected Firefox inside timeout. Applying image wrapper size patch...');

  //     const editorElement: HTMLElement = quill.root;
  //     // Select the wrapper spans - result is NodeListOf<Element>
  //     const imageWrappers: NodeListOf<Element> = editorElement.querySelectorAll('span[class^="ql-image-align-"]'); 

  //     if (imageWrappers.length === 0) {
  //         // console.warn('Firefox patch (delayed): No image wrappers found in the editor content.');
  //     }

  //     // Loop through the results. 'wrapperElement' is of type Element.
  //     imageWrappers.forEach((wrapperElement: Element, index) => { 
  //       // *** Cast the Element to HTMLSpanElement ***
  //       const wrapperSpan = wrapperElement as HTMLSpanElement;

  //       // Now you can safely access properties and methods specific to HTMLSpanElement on 'wrapperSpan'

  //       const img = wrapperSpan.querySelector('img');
  //       if (!img) {
  //           // console.warn(`Firefox patch (delayed, Wrapper ${index}): No image found inside wrapper span.`);
  //           return;
  //       }

  //       // Get the original dimensions from the IMG attributes (as seen in your HTML)
  //       const imgWidthAttr = img.getAttribute('width');
  //       const imgHeightAttr = img.getAttribute('height'); // May be 'auto'

  //       // // Log the attributes found (useful for debugging)
  //       // console.log(`Firefox patch (delayed, Wrapper ${index}): Image width attribute:`, imgWidthAttr);
  //       // console.log(`Firefox patch (delayed, Wrapper ${index}): Image height attribute:`, imgHeightAttr);

  //       // The size is controlled by the --resize-width CSS variable on the wrapper's style
  //       // Ensure this variable is correctly set on the wrapper's inline style based on the image's width attribute
  //       if (imgWidthAttr) {
  //           // Ensure the value has 'px' for the CSS variable (attributes might not have it)
  //           const resizeWidthValue = imgWidthAttr.includes('px') ? imgWidthAttr : imgWidthAttr + 'px';

  //           // Set the CSS variable using setProperty on the element's style object
  //           // This directly modifies the inline style of the wrapper span
  //           // 'wrapperSpan.style' is safe because wrapperSpan is cast to HTMLSpanElement
  //           wrapperSpan.style.setProperty('--resize-width', resizeWidthValue);
  //           // console.log(`Firefox patch (delayed, Wrapper ${index}): Set --resize-width on wrapper to:`, resizeWidthValue);

  //           // Optional: Force a browser reflow/repaint (try if needed)
  //           // wrapperSpan.offsetHeight;
  //       } else {
  //           //  console.warn(`Firefox patch (delayed, Wrapper ${index}): Image has no width attribute. Cannot set --resize-width on wrapper.`);
  //       }
  //     });
  //     // console.log('Firefox image wrapper size patch code finished after timeout.');
  //   } else {
  //     // console.log('Not Firefox, skipping image wrapper size patch after timeout.');
  //   }
  // }, 0);
