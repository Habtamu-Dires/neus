import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceBoxComponent } from './resource-box.component';

describe('ResourceBoxComponent', () => {
  let component: ResourceBoxComponent;
  let fixture: ComponentFixture<ResourceBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceBoxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
