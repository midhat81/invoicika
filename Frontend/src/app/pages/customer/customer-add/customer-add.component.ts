import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { CustomerService } from 'src/app/services/customer.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-customer-add',
  templateUrl: './customer-add.component.html',
  styleUrls: ['./customer-add.component.less'],
})
export class CustomerAddComponent {
  addCustomerForm: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.addCustomerForm = this.fb.group({
      name: new FormControl<string | null>(null, [Validators.required]),
      address: new FormControl<string | null>(null),
      phoneNumber: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null, [Validators.email]),
    });
  }

  submitForm(): void {
    if (this.addCustomerForm.valid) {
      const newCustomer = {
        ...this.addCustomerForm.value,
      };

      this.customerService.addCustomer(newCustomer).subscribe({
        next: () => {
          this.message.success('Customer added successfully');
          this.router.navigate(['/customers/all']);
        },
        error: (err) => {
          this.message.error('Error adding customer');
          console.error('Error adding customer:', err);
        },
      });
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.addCustomerForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/customers/all']);
  }
}
