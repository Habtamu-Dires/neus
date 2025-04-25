import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumeExamDialogComponent } from './resume-exam-dialog.component';

describe('ResumeExamDialogComponent', () => {
  let component: ResumeExamDialogComponent;
  let fixture: ComponentFixture<ResumeExamDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumeExamDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumeExamDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
