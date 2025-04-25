import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionListDrawerComponent } from './question-list-drawer.component';

describe('QuestionListDrawerComponent', () => {
  let component: QuestionListDrawerComponent;
  let fixture: ComponentFixture<QuestionListDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionListDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionListDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
