import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';


@Component({
  selector: 'app-pdf-reader-extended',
  imports: [NgxExtendedPdfViewerModule,CommonModule],
  templateUrl: './pdf-reader-extended.component.html',
  styleUrl: './pdf-reader-extended.component.css'
})
export class PdfReaderExtendedComponent {
  pdfSrc = 'assets/your-file.pdf';
  title = 'My PDF Document';

  constructor(private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.pdfSrc = params['pdfSrc'] || this.pdfSrc;
      this.title = params['title'] || this.title;
    });
    if (!this.pdfSrc) {
      console.warn('No PDF source provided to PdfReaderComponent');
    }
  }
  

  close() {
    window.history.back();
  }
}
