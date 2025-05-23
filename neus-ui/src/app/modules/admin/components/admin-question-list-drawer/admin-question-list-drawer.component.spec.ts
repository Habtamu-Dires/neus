import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQuestionListDrawerComponent } from './admin-question-list-drawer.component';

describe('AdminQuestionListDrawerComponent', () => {
  let component: AdminQuestionListDrawerComponent;
  let fixture: ComponentFixture<AdminQuestionListDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminQuestionListDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQuestionListDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
