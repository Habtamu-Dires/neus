import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamResultDialogComponent } from './exam-result-dialog.component';

describe('ExamResultDialogComponent', () => {
  let component: ExamResultDialogComponent;
  let fixture: ComponentFixture<ExamResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamResultDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExamResultDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
