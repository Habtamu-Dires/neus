import { Component, OnInit } from '@angular/core';
import { CreateResourceDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ResourcesService } from '../../../../services/services';
import { MatDialog } from '@angular/material/dialog';
import { EditDialogComponent } from '../../components/edit-dialog/edit-dialog.component';

@Component({
  selector: 'app-manage-resource',
  imports: [CommonModule,FormsModule],
  templateUrl: './manage-resource.component.html',
  styleUrl: './manage-resource.component.css'
})
export class ManageResourceComponent implements OnInit{
  
  createResourceDto:CreateResourceDto = {
    type: 'NOTE',
    requiredSubLevel: 'FREE'
  }
  selectedFile:any;
  selectedFileType:string = '';
  errMsgs:Array<string> = [];
  showSubscriptionLevelList:boolean = false;
  subscriptionLevelList:Array<string> = ['FREE','BASIC','ADVANCED','PREMIUM'];
  typeList:Array<string> = ['NOTE','VIDEO','BOOK'];
  showTypeList:boolean = false;
  showFileTypeMatchError:boolean = false;
  isUploading = false;



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
  }


  // create resource
  createResource(){
    this.resourceService.createResource({
      body: {
        dto: this.createResourceDto,
        file: this.selectedFile
      }
    }).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.toastrService.success('Resource created successfully', 'Success');
        this.router.navigate(['admin','resources']);
      }
      , error: (error) => {
        this.isUploading = false;
        console.log(error);
        this.toastrService.error('Error creating resource', 'Error');
      }
    });
  }

  //fetch resource by id
  fetchResourceById(id:string){
    this.resourceService.getResourceById({
      'resource-id': id
    })
    .subscribe({
      next: (response) => {
        this.createResourceDto = response as CreateResourceDto;
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
          this.updateResourceContent();
        }
      }
      , error: (error) => {
        console.log(error);
        this.toastrService.error('Error updating resource', 'Error'); 
      }
    });
  }

  // upload file
  updateResourceContent(){
    this.resourceService.updateResourceContent({
      'resource-id': this.createResourceDto.id as string,
      body:{
        file: this.selectedFile
      } 
    }).subscribe({
      next:()=>{
        this.isUploading = false;
        this.toastrService.success('Resource content updated successfully', 'Success');
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

  // on save btn clicked
  onSave() {
    if (this.selectedFileType === 'application/pdf' && this.createResourceDto.type === 'VIDEO') {
      this.showFileTypeMatchError = true;
  } else if (this.selectedFileType === 'video/mp4' && 
      (this.createResourceDto.type === 'NOTE' || this.createResourceDto.type === 'BOOK')) {
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
  onFileSelected(event:any){
    const file = event.target.files[0];
     this.selectedFileType = file.type;
    console.log(this.selectedFileType);
    if(file){
      this.selectedFile = file;
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


  //open edit dialog
  openEditDialog(){
    const dialog = this.matDialog.open(EditDialogComponent,{
        maxWidth: '90vw', // 90% of viewport width
        maxHeight: '90vh', // 90% of viewport height
        width: '60%', // Default width, constrained by maxWidth
        height: '70%', // Let content determine height, constrained by maxHeight
        data:{
          content:this.createResourceDto.description,
          title: 'Resource Description'
        }
    });

    dialog.afterClosed().subscribe((result) => {
      if(result){
        console.log("udpated " + result)
        this.createResourceDto.description = result.content;
      }
    });
  }

  // on cancle btn clicked
  onCancel() {
    this.router.navigate(['admin','resources']);
  }
}
