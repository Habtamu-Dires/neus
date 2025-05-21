import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../../../services/services';
import { ResourceInfoDto } from '../../../../services/models';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-collection-selection',
  imports: [CommonModule],
  templateUrl: './collection-selection.component.html',
  styleUrl: './collection-selection.component.css'
})
export class CollectionSelectionComponent implements OnInit{

  lectureId:string | undefined;
  collectionList:ResourceInfoDto[] = [];
  resourceNotFound:boolean = false;
  isLoading:boolean = true;

  constructor(
    private activatedRoute:ActivatedRoute,
    private resoucesService:ResourcesService,
    private router:Router,
    private toastrServce:ToastrService
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.lectureId = params['lectureId'];
      if(this.lectureId){
        this.fetchListCollections(this.lectureId);
      }
    });
  }

  // fetch list of collection resouces
  fetchListCollections(lectureId:string){
    this.resoucesService.getListOfCollections({
      'lecture-id': lectureId
    }).subscribe({
      next:(res:ResourceInfoDto[])=>{
        this.collectionList = res;
        this.isLoading = false;
        if(res.length === 0){
          this.resourceNotFound = true;
        }
      },
      error:(err)=>{
        console.log(err);
        this.isLoading = false;
        this.toastrServce.error(err);
      }
    })
  }

  // select collection
  selectCollection(collection:ResourceInfoDto){
    this.router.navigate(['user','collections',collection.resourceId])
  }

  // close
  onClose(){
     this.router.navigate(['user'], {queryParams: {'from-resource-detail': true}});
  }

}
