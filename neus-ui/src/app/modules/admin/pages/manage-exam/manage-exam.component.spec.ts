import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageExamComponent } from './manage-exam.component';

describe('ManageExamComponent', () => {
  let component: ManageExamComponent;
  let fixture: ComponentFixture<ManageExamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageExamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageExamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
