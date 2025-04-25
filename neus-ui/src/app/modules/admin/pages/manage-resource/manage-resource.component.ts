import { Component, OnInit } from '@angular/core';
import { CreateResourceDto, ListOfResourcesDto, ResourceDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResourcesService } from '../../../../services/services';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { debounceTime, throttleTime } from 'rxjs';

@Component({
  selector: 'app-manage-resource',
  imports: [CommonModule,FormsModule, ReactiveFormsModule],
  templateUrl: './manage-resource.component.html',
  styleUrl: './manage-resource.component.css'
})
export class ManageResourceComponent implements OnInit{
  
  createResourceDto:CreateResourceDto = {
    type: 'READING_MATERIAL',
    requiredSubLevel: 'NONE'
  }
  selectedFile:any;
  selectedFileType:string = '';
  previewFile:any;
  errMsgs:Array<string> = [];
  showSubscriptionLevelList:boolean = false;
  subscriptionLevelList:Array<string> = ['NONE','BASIC','ADVANCED','PREMIUM'];
  typeList:Array<string> = ["READING_MATERIAL", "VIDEO" , "LECTURE_VIDEOS" , "LECTURE_NOTES","BOOK"];
  showTypeList:boolean = false;
  showFileTypeMatchError:boolean = false;
  showPreviewFileTypeMatchError:boolean = false;
  isUploading = false;
  searchControl = new FormControl('');
  showParentResourceList = false;
  parentResourceList:ResourceDto[] = [];
  parentResourceName = '';

  constructor(
    private resourceService:ResourcesService,
    private router:Router,
    private activatedRoute: ActivatedRoute,
    private toastrService:ToastrService,
    private matDialog:MatDialog
  ){}

  ngOnInit(): void {
    const resourceId = this.activatedRoute.snapshot.params['resourceId'];
    if(resourceId){
      this.fetchResourceById(resourceId);
    }
    // form
    this.parentSearchFormControl();
  }


  // create resource
  createResource(){
    this.resourceService.createResource({
      body: {
        dto: this.createResourceDto,
        file: this.selectedFile,
        previewFile: this.previewFile
      }
    }).subscribe({
      next: () => {
        this.isUploading = false;
        this.toastrService.success('Resource created successfully', 'Success');
        this.router.navigate(['admin','resources']);
      }
      , error: (err) => {
        this.isUploading = false;
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        }else {
          this.toastrService.error('Something went wrong', 'Error');
        }
      }
    });
  }

  //fetch resource by id
  fetchResourceById(id:string){
    this.resourceService.getResourceById({
      'resource-id': id
    })
    .subscribe({
      next: (res:ResourceDto) => {
        this.createResourceDto = {
          id:res.id,
          type: res.type as "EXAM" | "VIDEO" | "BOOK" | "READING_MATERIAL" | "LECTURE_VIDEOS" | "LECTURE_VIDEOS",
          title: res.title,
          requiredSubLevel: res.requiredSubLevel as "NONE" | "BASIC" | "ADVANCED" | "PREMIUM",
          department: res.department,
          description: res.description,
          contentPath:res.contentPath,
          previewResourcePath: res.previewContentPath,
          parentResourceId: res.parentResourceId

        };
        this.parentResourceName = res.parentResourceTitle as string;
        this.searchControl.setValue(res.parentResourceTitle as string);
      },
      error: (error) => {
        console.log(error);
        this.toastrService.error('Error fetching resource', 'Error');
      }
    });
  }

  // update resource
  updateResource(){
    this.resourceService.updateResource({
      'resource-id': this.createResourceDto.id as string,
      body: this.createResourceDto
    }).subscribe({
      next: () => {
        this.toastrService.success('Resource updated successfully', 'Success');
        if(this.selectedFile){
          this.updateResourceContent(this.selectedFile,false);
        }
        if(this.previewFile){
          this.updateResourceContent(this.previewFile,true);
        }
        if(!this.selectedFile && !this.previewFile){
          this.isUploading = false;
          window.history.back();
        }
      }
      , error: (err) => {
        console.log(err);
        if(err.error.validationErrors){
          this.errMsgs = err.error.validationErrors;
        }else {
          this.toastrService.error('Something went wrong', 'Error');
        } 
      }
    });
  }

  // upload file
  updateResourceContent(file:any,isPreview:boolean){
    this.resourceService.updateResourceContent({
      'resource-id': this.createResourceDto.id as string,
      isPreview: isPreview,
      body:{
        file: file
      } 
    }).subscribe({
      next:()=>{
        this.isUploading = false;
        if(!isPreview){
          this.toastrService.success('Resource content updated successfully', 'Success');
        } else {
          this.toastrService.success('Resource preview content updated successfully', 'Success');
        }
        this.router.navigate(['admin','resources']);
        this.selectedFile = null;
      },
      error:(err)=>{
        this.isUploading = false;
        console.log(err);
        this.toastrService.error('Error uploading the content', 'Error');
      }
    })
  }

  // search parent resources by title
  searchParentResourceByTitle(title:string){
    this.resourceService.searchParentResourceByTitle({
      'title': title
    }).subscribe({
      next: (res:ResourceDto[]) => {
        console.log(res);
        this.parentResourceList = res;
        if(res.length > 0){
          this.showParentResourceList = true;
        }
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Error fetching resources', 'Error');
      }
    })
  }

  // on parent resource selected
  onParentResourceSelected(resource:ResourceDto){
    this.parentResourceName = resource.title as string;
    this.searchControl.setValue(this.parentResourceName);
    this.createResourceDto.parentResourceId = resource.id;
    this.showParentResourceList = false;
  }

  // parent seach from control
  parentSearchFormControl(){
    this.searchControl.valueChanges
     .pipe(
        debounceTime(300),  // wait 300ms after user stop writing
        throttleTime(1000) // one request per second
     ).subscribe((value:any)=>{
       const text = value as string;
       if(text.length >= 3){
          if(this.parentResourceName !== text){
            this.searchParentResourceByTitle(text);
          }
       }
     })
  }

  // on save btn clicked
  onSave() {
    if (this.selectedFileType === 'application/pdf' && this.createResourceDto.type === 'VIDEO') {
      this.showFileTypeMatchError = true;
  } else if (this.selectedFileType === 'video/mp4' && 
      (this.createResourceDto.type === 'READING_MATERIAL' || this.createResourceDto.type === 'BOOK')) {
      this.showFileTypeMatchError = true;
    }else {
        // if no error
        this.isUploading = true;
        if(this.createResourceDto.id){  
          this.updateResource();
        } else {
          this.createResource();
        }
    }
  }

  //file methods
  onFileSelected(event:any,isPreview:boolean){
    const file = event.target.files[0];
     this.selectedFileType = file.type;
    console.log(this.selectedFileType);
    if(file && !isPreview){
      this.selectedFile = file;
    } else if(file && isPreview){
      this.previewFile = file;
    }
  
  }

  // on subscription level selected
  onSubscriptionLevelSelected(level:any){
    this.createResourceDto.requiredSubLevel = level;
    this.showSubscriptionLevelList = false;
  }
  // on type selected
  onTypeSelected(type:any){
    this.createResourceDto.type = type;
    this.showTypeList = false;
  }

  resetFileInput(element:HTMLInputElement, isPreview:boolean){
    element.value = '';
    if(isPreview){
      this.previewFile = null;
    } else {
      this.selectedFile = null;
    }
  }

  //delete file
  deleteFile(url:any, isPreview:boolean){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
        width: '400px',
        data:{
          message:'you wants to delete this resource',
          buttonName: 'Delete',
          isWarning: true
        }
    });
      dialog.afterClosed().subscribe((result) => {
        if(result){
          this.deleteContent(url, isPreview);
        }
      });
  }

  // delete content
  deleteContent(url:string, isPreview:boolean){
    this.resourceService.deleteResourceContent({
      'resource-id': this.createResourceDto.id as string,
      'url': url,
      'isPreview': isPreview
    }).subscribe({
      next:()=>{
        this.toastrService.success('Content deleted sucessfully', 'Done');
        this.fetchResourceById(this.createResourceDto.id as string);
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Something went wrong', 'Error');
      }
    })
  }

  // on cancle btn clicked
  onCancel() {
    this.router.navigate(['admin','resources']);
  }
}
