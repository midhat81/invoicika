import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { CustomerService } from 'src/app/services/customer.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-customer-edit',
  templateUrl: './customer-edit.component.html',
  styleUrls: ['./customer-edit.component.less']
})
export class CustomerEditComponent implements OnInit {
  editCustomerForm: FormGroup;
  customerId!: string;
  loading = true;

  constructor(
    private fb: NonNullableFormBuilder,
    private customerService: CustomerService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.editCustomerForm = this.fb.group({
      name: new FormControl<string | null>(null, [Validators.required]),
      address: new FormControl<string | null>(null),
      phoneNumber: new FormControl<string | null>(null),
      email: new FormControl<string | null>(null, [Validators.email])
    });
  }

  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('customerId')!;
    this.customerService.getCustomerById(this.customerId).subscribe((customer) => {
      this.editCustomerForm.patchValue({
        name: customer.name,
        address: customer.address,
        phoneNumber: customer.phoneNumber,
        email: customer.email
      });
      this.loading = false;
    }, error => {
      this.message.error('Error loading customer details');
      this.loading = false;
    });
  }

  submitForm(): void {
    if (this.editCustomerForm.valid) {
      this.loading = true;
      const updatedCustomer = {
        customerId: this.customerId,
        ...this.editCustomerForm.value
      };

      this.customerService.updateCustomer(this.customerId, updatedCustomer).subscribe({
        next: () => {
          this.loading = false;
          this.message.success('Customer updated successfully');
          this.router.navigate(['/customers/all']);
        },
        error: (err) => {
          this.loading = false;
          this.message.error('Error updating customer');
          console.error('Error updating customer:', err);
        }
      });
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.editCustomerForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/customers/all']);
  }
}
