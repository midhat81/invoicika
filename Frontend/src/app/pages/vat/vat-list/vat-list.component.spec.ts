import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatListComponent } from './vat-list.component';

describe('VatListComponent', () => {
  let component: VatListComponent;
  let fixture: ComponentFixture<VatListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatListComponent]
    });
    fixture = TestBed.createComponent(VatListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
