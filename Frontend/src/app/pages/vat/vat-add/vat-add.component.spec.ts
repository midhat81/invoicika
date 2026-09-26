import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatAddComponent } from './vat-add.component';

describe('VatAddComponent', () => {
  let component: VatAddComponent;
  let fixture: ComponentFixture<VatAddComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatAddComponent]
    });
    fixture = TestBed.createComponent(VatAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
