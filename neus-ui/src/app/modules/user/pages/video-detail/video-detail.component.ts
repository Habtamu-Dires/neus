import { Component, OnInit } from '@angular/core';
import { ResourceDetailDto } from '../../../../services/models';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../../../services/services';
import { VideoStreamComponent } from "../../../../components/video-stream/video-stream.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-detail',
  imports: [VideoStreamComponent,CommonModule],
  templateUrl: './video-detail.component.html',
  styleUrl: './video-detail.component.css'
})
export class VideoDetailComponent implements OnInit{

  videoId:string | undefined;
  resourceDetail:ResourceDetailDto = {}
  vidoeSrc:string = '';
  title:string = '';
  description:string = '';
  isVideoAvailable:boolean = false;

  constructor(
    private activatedRoute:ActivatedRoute,
    private resourcesService:ResourcesService,
    private router:Router
  ){}

  ngOnInit(): void {
    console.log("are we even here ??");
    this.videoId = this.activatedRoute.snapshot.params['videoId'];
    if(this.videoId){
      console.log("video id " + this.videoId)
      this.fetchVideoDetailById(this.videoId);
    }
  }

  // fetch pdf
  fetchVideoDetailById(videoId:string){
    this.resourcesService.getResourceDetail({
      'resource-id': videoId
    }).subscribe({
      next:(res:ResourceDetailDto)=>{
        console.log(res);
        this.resourceDetail = res;
        this.vidoeSrc = this.resourceDetail.contentPath as string;
        this.title = res.title as  string;
        this.description = res.description as string;
        this.isVideoAvailable = true;
      },
      error:(err) =>{
        console.log(err);
      }
    })
  }

  onClose(){
    this.router.navigate(['user']);
  }

}
