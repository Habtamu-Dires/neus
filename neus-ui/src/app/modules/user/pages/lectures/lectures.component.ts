import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../../../services/services';
import { ResourceCollectionDto, ResourceDetailDto, ResourceDto, UserDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoDetailComponent } from "../video-detail/video-detail.component";
import { PdfDetailComponent } from "../pdf-detail/pdf-detail.component";
import { LecturesDrawerComponent } from "../../components/lectures-drawer/lectures-drawer.component";

@Component({
  selector: 'app-lectures',
  imports: [CommonModule, FormsModule, VideoDetailComponent, PdfDetailComponent, LecturesDrawerComponent],
  templateUrl: './lectures.component.html',
  styleUrl: './lectures.component.css'
})
export class LecturesComponent implements OnInit{

  lectureId:string | undefined;
  resourceList:ResourceDto[] = [];
  lecture:ResourceCollectionDto | undefined;
  selectedResource:ResourceDto | undefined;
  currentResourceIndex:number = 0;
  showDrawer:boolean = false;

  constructor(
    private activatedRoute:ActivatedRoute,
    private resourcesService:ResourcesService,
    private router:Router
  ){}

  ngOnInit(): void {
    this.lectureId = this.activatedRoute.snapshot.params['lectureId'];
    if(this.lectureId){
      this.fetchLectureById();
      console.log("hello")
    }
  }

  // fetch lecture by id
  fetchLectureById(){
    this.resourcesService.getResourceCollection({
      'resource-id': this.lectureId as string
    }).subscribe({
      next:(res:ResourceCollectionDto)=>{
        this.lecture = res;
        this.resourceList = res.resources as ResourceDto[];
        if(this.resourceList.length > 0){
          this.selectedResource = this.resourceList[0];
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
