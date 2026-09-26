import { AuthService } from './../../../services/auth.service';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CustomerInvoiceService } from 'src/app/services/customerinvoice.service';

@Component({
  selector: 'app-invoice-edit',
  templateUrl: './invoice-edit.component.html',
  styleUrls: ['./invoice-edit.component.less'],
})
export class InvoiceEditComponent implements OnInit {
  validateForm!: FormGroup;
  customersList: any[] = [];
  usersList: any[] = [];
  vatsList: any[] = [];
  itemsList: any[] = [];
  subTotalAmount = 0;
  vatAmount = 0;
  totalAmount = 0;
  invoiceId: string = '';
  currentUser: any;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private invoiceService: CustomerInvoiceService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private authservice: AuthService
  ) {}

  ngOnInit(): void {
    this.invoiceId =
      this.route.snapshot.paramMap.get('customerinvoiceId') || '';

    this.validateForm = this.fb.group({
      customerId: [null, [Validators.required]],
      userId: [null, [Validators.required]],
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
    this.loadInvoiceData();
    this.currentUser = this.authservice.getUserInfo().username;
  }

  loadCustomers() {
    this.invoiceService.getCustomers().subscribe((data: any) => {
      this.customersList = data.items;
      this.loading = false;
    });
  }

  loadUsers() {
    this.invoiceService.getUsers().subscribe((data: any) => {
      this.usersList = data;
      this.loading = false;
    });
  }

  loadVats() {
    this.invoiceService.getVats().subscribe((data: any) => {
      this.vatsList = data;
      this.loading = false;
    });
  }

  loadItems() {
    this.invoiceService.getItems().subscribe((data: any) => {
      this.itemsList = data.items;
      this.loading = false;
    });
  }

  loadInvoiceData() {
    if (this.invoiceId) {
      this.invoiceService
        .getCustomerInvoiceById(this.invoiceId)
        .subscribe((invoice: any) => {
          this.validateForm.patchValue({
            customerId: invoice.customer_id,
            userId: this.authservice.getUserInfo().userId,
            invoiceDate: invoice.invoiceDate,
            vatId: invoice.vat_id,
            subTotal: invoice.subTotalAmount,
            tax: invoice.vatAmount,
            total: invoice.totalAmount,
          });

          invoice.customerInvoiceLines.forEach((line: any) => {
            this.addLineItemWithData(line);
          });

          this.calculateTotals();
          this.loading = false;
        });

      this.loading = false;
    }
  }

  get lineItems(): FormArray {
    return this.validateForm.get('lineItems') as FormArray;
  }

  addLineItemWithData(lineItem: any) {
    const lineItemGroup = this.fb.group({
      item: [lineItem.item_id, Validators.required],
      description: [lineItem.itemDescription],
      quantity: [lineItem.quantity, Validators.required],
      price: [lineItem.price, Validators.required],
      total: [{ value: lineItem.quantity * lineItem.price, disabled: true }],
    });

    this.lineItems.push(lineItemGroup);
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
    if (this.validateForm.valid && this.invoiceId) {
      const formValue = this.validateForm.value;
      const payload = {
        customer_id: formValue.customerId,
        user_id: formValue.userId,
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

      this.invoiceService
        .updateCustomerInvoice(this.invoiceId, payload)
        .subscribe({
          next: () => {
            this.message.success('Invoice updated successfully');
            this.router.navigate(['/invoices/all']); // Redirect after success
          },
          error: (err) => {
            this.message.error('Error updating invoice');
          },
        });
    }
  }

  getUserName(userId: string): string {
    const user = this.usersList.find((u) => u.userId === userId);
    return user ? user.username : 'Unknown';
  }

  onBack(): void {
    this.router.navigate(['/invoices/all']);
  }

  printInvoice(invoiceId: string): void {
    this.invoiceService.makePdfInvoice(invoiceId).subscribe(
      (response: Blob) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const pdfWindow = window.open(url);
        if (pdfWindow) {
          pdfWindow.onload = () => {
            pdfWindow.focus();
            pdfWindow.print();
          };
        }
      },
      (error) => {
        this.message.error('Error generating the invoice PDF');
      }
    );
  }

  printInvoicePdf(invoiceId: string): void {
    this.invoiceService.makePdfInvoice(invoiceId).subscribe(
      (response: Blob) => {
        saveAs(response, `Invoice_${invoiceId}.pdf`);
      },
      (error) => {
        this.message.error('Error downloading the PDF');
      }
    );
  }

  emailInvoicePdf(customerInvoiceId: string): void {
    this.invoiceService.emailInvoice(customerInvoiceId).subscribe({
      next: (response) => {
        this.message.success(
          response.message || 'Invoice emailed successfully'
        );
      },
      error: (error) => {
        this.message.error(
          `Error sending invoice: ${error.error?.error || 'Unknown error'}`
        );
      },
    });
  }
}
