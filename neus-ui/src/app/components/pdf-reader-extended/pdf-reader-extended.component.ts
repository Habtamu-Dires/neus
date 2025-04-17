import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';


@Component({
  selector: 'app-pdf-reader-extended',
  imports: [NgxExtendedPdfViewerModule,CommonModule],
  templateUrl: './pdf-reader-extended.component.html',
  styleUrl: './pdf-reader-extended.component.css'
})
export class PdfReaderExtendedComponent {
  @Input() pdfSrc:string | undefined;
  @Output() onClose = new EventEmitter<{}>();
  


  close() {
    this.onClose.emit();
  }
}
