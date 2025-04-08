import { TestBed } from '@angular/core/testing';

import { AdminUxService } from './admin-ux.service';

describe('AdminUxService', () => {
  let service: AdminUxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminUxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
