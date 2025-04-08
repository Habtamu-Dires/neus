import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfReaderExtendedComponent } from './pdf-reader-extended.component';

describe('PdfReaderExtendedComponent', () => {
  let component: PdfReaderExtendedComponent;
  let fixture: ComponentFixture<PdfReaderExtendedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfReaderExtendedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfReaderExtendedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
