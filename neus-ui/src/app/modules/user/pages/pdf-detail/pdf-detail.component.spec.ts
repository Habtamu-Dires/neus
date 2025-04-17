import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDetailComponent } from './pdf-detail.component';

describe('PdfDetailComponent', () => {
  let component: PdfDetailComponent;
  let fixture: ComponentFixture<PdfDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
