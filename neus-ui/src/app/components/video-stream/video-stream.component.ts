import { Component, OnInit } from '@angular/core';
import { VgApiService } from '@videogular/ngx-videogular/core';
import { VgStreamingModule } from '@videogular/ngx-videogular/streaming';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-stream',
  imports: [CommonModule, VgStreamingModule, VgCoreModule, VgControlsModule, 
            VgOverlayPlayModule, VgBufferingModule, VgControlsModule],
  templateUrl: './video-stream.component.html',
  styleUrl: './video-stream.component.css'
})
export class VideoStreamComponent implements OnInit{

  videoSource: string = ''; // URL for the video (e.g., HLS .m3u8 or MP4)
  title: string = 'Video Lecture';

  api: VgApiService | undefined;
  isVideoAvailable: boolean = true; // Track if video is available
  errorMessage: string = ''; // Store error message

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.videoSource = params['videoSource'] || this.videoSource;
      this.title = params['title'] || this.title;
      // Reset state when source changes
      this.isVideoAvailable = true;
      this.errorMessage = '';
    });
  }

  onPlayerReady(api: VgApiService) {
    this.api = api;
    const media = this.api.getDefaultMedia();

    // Success case: metadata loaded
    media.subscriptions.loadedMetadata.subscribe(() => {
      if (this.api) {
        this.isVideoAvailable = true;
        this.errorMessage = '';
        this.api.play();
      }
    });

    // Error case: video failed to load
    media.subscriptions.error.subscribe((err: any) => {
      this.isVideoAvailable = false;
      this.errorMessage = 'Video not available or not supported.';
      console.error('Video error:', err);
    });

    // Check if source is invalid or unsupported (e.g., empty or wrong type)
    if (!this.videoSource) {
      this.isVideoAvailable = false;
      this.errorMessage = 'No video source provided.';
    }
  }

} 
