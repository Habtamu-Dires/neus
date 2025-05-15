import { Component } from '@angular/core';
import { ResourceCollectionDto, ResourceDetailDto, ResourceInfoDto } from '../../../../services/models';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../../../services/services';
import { LecturesDrawerComponent } from "../../components/lectures-drawer/lectures-drawer.component";
import { VideoDetailComponent } from "../video-detail/video-detail.component";
import { PdfDetailComponent } from "../pdf-detail/pdf-detail.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resource-collection',
  imports: [CommonModule, LecturesDrawerComponent, VideoDetailComponent, PdfDetailComponent],
  templateUrl: './resource-collection.component.html',
  styleUrl: './resource-collection.component.css'
})
export class ResourceCollectionComponent {

  collectionId:string | undefined;
  resourceList:ResourceInfoDto[] = [];
  collection:ResourceCollectionDto | undefined;
  selectedResource:ResourceInfoDto | undefined;
  currentResourceIndex:number = 0;
  showDrawer:boolean = false;

  constructor(
    private activatedRoute:ActivatedRoute,
    private resourcesService:ResourcesService,
    private router:Router
  ){}

  ngOnInit(): void {
    this.collectionId = this.activatedRoute.snapshot.params['collectionId'];
    if(this.collectionId){
      this.fetchLectureById();
    }
  }

  // fetch lecture by id
  fetchLectureById(){
    this.resourcesService.getResourceCollection({
      'resource-id': this.collectionId as string
    }).subscribe({
      next:(res:ResourceCollectionDto)=>{
        this.collection = res;
        this.resourceList = res.resourceList as ResourceInfoDto[];
        console.log("The list " + this.resourceList.length)
        if(this.resourceList.length > 0){
          this.selectedResource = this.resourceList[0];
          console.log("hello " + this.selectedResource.resourceId);
        }
      },
      error:(err)=>{
        console.log(err);
      }
    })
  }


  // select resource
  selectResource(index:number){
    this.selectedResource = undefined;
    this.currentResourceIndex = index;
    if(this.showDrawer){
      this.toggleDrawer();
    }
    setTimeout(()=>{
     this.selectedResource = this.resourceList[index];
    }, 0)
  }

  // toggle drawer
  toggleDrawer(){
    this.showDrawer = !this.showDrawer;
  }
}
