import { TestBed } from '@angular/core/testing';

import { UserSharedStateService } from './user-shared-state.service';

describe('UserSharedStateService', () => {
  let service: UserSharedStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserSharedStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
