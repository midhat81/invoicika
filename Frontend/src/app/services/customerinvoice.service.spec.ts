import { TestBed } from '@angular/core/testing';

import { CustomerinvoiceService } from './customerinvoice.service';

describe('CustomerinvoiceService', () => {
  let service: CustomerinvoiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerinvoiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
