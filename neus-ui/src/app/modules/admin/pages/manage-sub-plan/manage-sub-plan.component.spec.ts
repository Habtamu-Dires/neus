import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSubPlanComponent } from './manage-sub-plan.component';

describe('ManageSubPlanComponent', () => {
  let component: ManageSubPlanComponent;
  let fixture: ComponentFixture<ManageSubPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageSubPlanComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageSubPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
