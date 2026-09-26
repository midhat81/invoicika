import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatEditComponent } from './vat-edit.component';

describe('VatEditComponent', () => {
  let component: VatEditComponent;
  let fixture: ComponentFixture<VatEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatEditComponent]
    });
    fixture = TestBed.createComponent(VatEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
