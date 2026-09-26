import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerInvoiceService } from 'src/app/services/customerinvoice.service';

@Component({
  selector: 'app-invoice-add',
  templateUrl: './invoice-add.component.html',
  styleUrls: ['./invoice-add.component.less'],
})
export class InvoiceAddComponent implements OnInit {
  validateForm!: FormGroup;
  customersList: any[] = [];
  usersList: any[] = [];
  vatsList: any[] = [];
  itemsList: any[] = [];
  subTotalAmount = 0;
  vatAmount = 0;
  totalAmount = 0;
  userId: any;

  constructor(
    private fb: FormBuilder,
    private invoiceService: CustomerInvoiceService,
    private router: Router,
    private message: NzMessageService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.validateForm = this.fb.group({
      customerId: [null, [Validators.required]],
      invoiceDate: [null, [Validators.required]],
      vatId: [null],
      subTotal: [0],
      tax: [0],
      total: [0],
      lineItems: this.fb.array([]),
    });

    this.loadCustomers();
    this.loadUsers();
    this.loadVats();
    this.loadItems();
    this.addLineItem();
    this.userId = this.auth.getUserInfo().userId;
  }

  loadCustomers() {
    this.invoiceService.getCustomers().subscribe((data: any) => {
      this.customersList = data.items;
    });
  }

  loadUsers() {
    this.invoiceService.getUsers().subscribe((data: any) => {
      this.usersList = data;
    });
  }

  loadVats() {
    this.invoiceService.getVats().subscribe((data: any) => {
      this.vatsList = data;
      const defaultVat = this.vatsList.find((vat) => vat.percentage === 5); // Set default VAT to 5%
      if (defaultVat) {
        this.validateForm.patchValue({ vatId: defaultVat.vatId });
        this.calculateVatAmount();
      }
    });
  }

  loadItems() {
    this.invoiceService.getItems().subscribe((data: any) => {
      this.itemsList = data.items;
    });
  }

  get lineItems(): FormArray {
    return this.validateForm.get('lineItems') as FormArray;
  }

  addLineItem() {
    const lineItemGroup = this.fb.group({
      item: [null, Validators.required],
      description: [''],
      quantity: [1, Validators.required],
      price: [0, Validators.required],
      total: [{ value: 0, disabled: true }],
    });

    this.lineItems.push(lineItemGroup);
  }

  removeLineItem(index: number) {
    this.lineItems.removeAt(index);
    this.calculateTotals();
  }

  calculateTotals() {
    this.subTotalAmount = this.lineItems.controls.reduce((sum, lineItem) => {
      const quantity = lineItem.get('quantity')?.value || 0;
      const price = lineItem.get('price')?.value || 0;
      const total = quantity * price;
      lineItem.get('total')?.setValue(total);
      return sum + total;
    }, 0);

    this.calculateVatAmount();
  }

  calculateVatAmount() {
    const vatId = this.validateForm.get('vatId')?.value;
    const vat = this.vatsList.find((v) => v.vatId === vatId);
    const percentage = vat ? vat.percentage : 0;
    this.vatAmount = this.subTotalAmount * (percentage / 100);
    this.totalAmount = this.subTotalAmount + this.vatAmount;

    this.validateForm.patchValue({
      tax: this.vatAmount.toFixed(2),
      total: this.totalAmount.toFixed(2),
      subTotal: this.subTotalAmount.toFixed(2),
    });
  }

  onItemChange(index: number, itemId: string) {
    const selectedItem = this.itemsList.find((item) => item.itemId === itemId);
    if (selectedItem) {
      const lineItemGroup = this.lineItems.at(index);
      lineItemGroup.patchValue({
        description: selectedItem.description,
        price: selectedItem.salePrice,
      });
      this.calculateTotals();
    }
  }

  submitForm(): void {
    if (this.validateForm.valid) {
      const formValue = this.validateForm.value;
      const payload = {
        customer_id: formValue.customerId,
        user_id: this.userId,
        invoiceDate: formValue.invoiceDate,
        vat_id: formValue.vatId,
        subTotalAmount: parseFloat(formValue.subTotal),
        vatAmount: parseFloat(formValue.tax),
        totalAmount: parseFloat(formValue.total),
        customerInvoiceLines: formValue.lineItems.map((item: any) => ({
          item_id: item.item,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      this.invoiceService.addCustomerInvoice(payload).subscribe({
        next: () => {
          this.message.success('Invoice added successfully');
          this.router.navigate(['/invoices/all']); // Redirect after success
        },
        error: (err) => {
          this.message.error('Error adding invoice');
          console.error('Error adding invoice:', err);
        },
      });
    }
  }

  onBack(): void {
    this.router.navigate(['/invoices/all']);
  }
}
