import { Component, HostListener, OnInit } from '@angular/core';
import { ResourceDto, UserDto } from '../../../../services/models';
import { ResourcesService } from '../../../../services/services';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from "../../components/header/header.component";
import { PaginationComponent } from "../../components/pagination/pagination.component";
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ReadDialogComponent } from '../../components/read-dialog/read-dialog.component';
import { ConfirmDialogComponent } from '../../../../components/confirm-dialog/confirm-dialog.component';
import { AdminUxService } from '../../service/admin-ux/admin-ux.service';


@Component({
  selector: 'app-resource',
  imports: [HeaderComponent, PaginationComponent,FormsModule,CommonModule],
  templateUrl: './resource.component.html',
  styleUrl: './resource.component.css'
})
export class ResourceComponent implements OnInit{

  resourcesList:ResourceDto[] = [];
  selectedResourceId:string = '';
  showActions:boolean = false;
  isLoading = true;
  // pagination
  page:number = 0;
  size:number = 10;
  isEmptyPage: boolean = true;
  isFirstPage: boolean |undefined; 
  isLastPage: boolean |undefined;
  totalPages: number | undefined;
  totalElements: number | undefined;
  numberOfElements: number | undefined;
  // fiters
  titleFilter:string | undefined;
  typeFilter:string | undefined;
  subLevelFilter:string | undefined;

  constructor(
    private resourceService: ResourcesService,
    private toastr:ToastrService,
    private router:Router,
    private matDialog:MatDialog,
    private toastrService:ToastrService,
    private adminUxService:AdminUxService
  ){}

  ngOnInit(): void {
    this.page = this.adminUxService.resourcePageNo();
    this.fetchPageOfResources();
  }

  // fetch page of resouce
  fetchPageOfResources(){
    this.resourceService.getPageOfResources({
      page: this.page,
      size: this.size
    }).subscribe({
      next:(res)=>{
        this.resourcesList = res.content as ResourceDto[];
        this.isLoading = false;        
        // pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
        // update page
        this.adminUxService.updateResourcePageNo(this.page);
      },
      error:(err)=>{
        console.log(err);
        this.isLoading=false;
        this.toastr.error('Error fetching users', 'Error');
      }
    })
  }

  // filter user
  filterResource(){
    this.resourceService.filterResources({
      'title':this.titleFilter,
      'type': this.typeFilter,
      'requiredSubLevel': this.subLevelFilter
    }).subscribe({
      next:(res)=>{
        this.resourcesList = res.content as ResourceDto[];
        console.log(this.resourcesList);
        // pagination
        this.isFirstPage = res.first;
        this.isLastPage = res.last;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.numberOfElements = res.numberOfElements;
        this.isEmptyPage = res.empty as boolean;
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }

  // on create new 
  onCreateNew(){
    this.router.navigate(['/admin/resources/manage']);
  }

  // on read dialog
  readDescription(description:any, title:any){
    console.log("The descripiton " + description)
    const dialog = this.matDialog.open(ReadDialogComponent,{
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: '60%',
      height: '60%',
          data:{
            content:description,
            title: title
          }
    });

    dialog.afterClosed().subscribe((result) => {
      if(result){
        console.log('user status toggled');
      }
    });

  }

  // on view content
  viewContent(resouce:ResourceDto, isPreview:boolean){
    console.log("tye " + resouce);
    if(resouce.type === 'VIDEO'){
      this.router.navigate(['admin','video-streamer'],
        {queryParams:{
          'videoSrc': isPreview ? resouce.previewContentPath : resouce.contentPath, 
          'title': resouce.title,
          'description':resouce.description
        }})
    } else {
      this.router.navigate(['admin','pdf-reader'],
        {queryParams:{
          'pdfSrc': isPreview ? resouce.previewContentPath : resouce.contentPath
        }})
    }
  }

  // on show actions
  onShowActions(resourceId:any){
    this.showActions = !this.showActions;
    this.selectedResourceId = resourceId as string;
  }

  // on edit
  onEdit(resourceId:any){
    this.router.navigate(['/admin/resources/manage', resourceId]);
  }

  // on delte
  onDelete(resouceId:any){
    const dialog = this.matDialog.open(ConfirmDialogComponent,{
          width: '400px',
          data:{
            message:'you wants to delete this user',
            buttonName: 'Delete',
            isWarning: true
          }
    });
    dialog.afterClosed().subscribe((result) => {
      if(result){
        this.delterResource(resouceId)
      }
    });
  }

  // delete resource
  delterResource(resourceId:any){
    this.resourceService.deleteResource({
      'resource-id': resourceId as string
    }).subscribe({
      next:()=>{
        this.toastrService.success('Resource deleted successfully', 'Success');
        this.fetchPageOfResources();
      },
      error:(err)=>{
        console.log(err);
        this.toastrService.error('Something went wroing', 'Error');
      }
    })
  }

  // on search 
  onSearch(text:any){
    if(text.length >= 3){
      this.titleFilter = text;
      this.filterResource();
    } else {
      this.fetchPageOfResources();
    }
  }

  // on type filter
  onTypeFilter(type:string){
    if(type.length > 0){
      this.typeFilter = type;
      this.filterResource();
    } else {
      this.fetchPageOfResources();
    }
  }
  // on sub level filter
  onSubLevelFilter(level:string){
    if(level.length > 0){
      this.subLevelFilter = level;
      this.filterResource();
    } else {
      this.fetchPageOfResources();
    }
  }



  // pagination
  onSizeChanged(size:number){
    this.size=size;
    this.fetchPageOfResources();
  }

  onPageChanged(page:number){
    this.page=page;
    this.fetchPageOfResources();
  }

  // hide delete & edit btn onclick outside the btn
  @HostListener('document:click', ['$event'])
  hideDeleteBtn(event: MouseEvent){
    const target = event.target as HTMLElement;
    if(!target.classList.contains('donthide')){
      this.showActions = false;
    }
  }

}
