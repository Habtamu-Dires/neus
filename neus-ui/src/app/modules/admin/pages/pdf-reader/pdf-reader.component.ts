import { Component, OnInit } from '@angular/core';
import { PdfReaderExtendedComponent } from "../../../../components/pdf-reader-extended/pdf-reader-extended.component";
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pdf-reader',
  imports: [PdfReaderExtendedComponent],
  templateUrl: './pdf-reader.component.html',
  styleUrl: './pdf-reader.component.css'
})
export class PdfReaderComponent implements OnInit{

  pdfSrc:string | undefined;
  isLoading:boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.pdfSrc = params['pdfSrc'];
      this.isLoading = false;
    });
    
  }

  onClose(){
    this.router.navigate(['admin','resources']);
  }
}
