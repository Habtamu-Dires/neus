import { Component, Input, OnInit } from '@angular/core';
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

  @Input() videoId:string | undefined;
  resourceDetail:ResourceDetailDto = {}
  vidoeSrc:string = '';
  title:string = '';
  description:string = '';
  isLoading:boolean = true;


  constructor(
    private activatedRoute:ActivatedRoute,
    private resourcesService:ResourcesService,
    private router:Router
  ){}

  ngOnInit(): void {
    const videoId = this.activatedRoute.snapshot.params['videoId'];
    if(videoId){
      this.fetchVideoDetailById(videoId);
    } else if(this.videoId){
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
        this.isLoading = false;
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
