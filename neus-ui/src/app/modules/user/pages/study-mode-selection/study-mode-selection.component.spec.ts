import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudyModeSelectionComponent } from './study-mode-selection.component';

describe('StudyModeSelectionComponent', () => {
  let component: StudyModeSelectionComponent;
  let fixture: ComponentFixture<StudyModeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudyModeSelectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudyModeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
