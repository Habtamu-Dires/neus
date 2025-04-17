import { Component, OnInit } from '@angular/core';
import { UserDto } from '../../../../services/models';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoStreamComponent } from "../../../../components/video-stream/video-stream.component";

@Component({
  selector: 'app-video-streamer',
  imports: [VideoStreamComponent],
  templateUrl: './video-streamer.component.html',
  styleUrl: './video-streamer.component.css'
})
export class VideoStreamerComponent implements OnInit{
  
  videoSource:string = '';
  title:string | undefined;
  description:string = '';

  constructor(
    private activatedRoute:ActivatedRoute,
    private router:Router
  ){}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.videoSource = params['videoSrc'];
      this.title = params['title'];
      this.description=params['description']
    });
  }

  onClose(){
    this.router.navigate(['admin','resources']);
  }


}
