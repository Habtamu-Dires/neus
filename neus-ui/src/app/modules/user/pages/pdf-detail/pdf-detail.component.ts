import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesService } from '../../../../services/services';
import { ResourceDetailDto, ResourceDto, UserDto } from '../../../../services/models';
import { PdfReaderExtendedComponent } from "../../../../components/pdf-reader-extended/pdf-reader-extended.component";

@Component({
  selector: 'app-pdf-detail',
  imports: [PdfReaderExtendedComponent],
  templateUrl: './pdf-detail.component.html',
  styleUrl: './pdf-detail.component.css'
})
export class PdfDetailComponent implements OnInit{
  
  pdfId:string | undefined;
  resourceDetail:ResourceDetailDto = {}
  pdfSrc:string | undefined;

  constructor(
    private activatedRoute:ActivatedRoute,
    private resourcesService:ResourcesService,
    private router:Router
  ){}

  ngOnInit(): void {
    this.pdfId = this.activatedRoute.snapshot.params['pdfId'];
    if(this.pdfId){
      this.fetchPdfDetailById(this.pdfId);
    }
  }

  // fetch pdf
  fetchPdfDetailById(pdfId:string){
    this.resourcesService.getResourceDetail({
      'resource-id': pdfId
    }).subscribe({
      next:(res:ResourceDetailDto)=>{
        console.log(res);
        this.resourceDetail = res;
        this.pdfSrc = this.resourceDetail.contentPath;
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
