import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceListDrawerComponent } from './resource-list-drawer.component';

describe('ResourceListDrawerComponent', () => {
  let component: ResourceListDrawerComponent;
  let fixture: ComponentFixture<ResourceListDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceListDrawerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceListDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
