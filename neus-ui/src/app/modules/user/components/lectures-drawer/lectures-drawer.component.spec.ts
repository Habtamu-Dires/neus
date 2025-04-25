import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturesDrawerComponent } from './lectures-drawer.component';

describe('LecturesDrawerComponent', () => {
  let component: LecturesDrawerComponent;
  let fixture: ComponentFixture<LecturesDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturesDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturesDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
