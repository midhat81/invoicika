import { CustomerService } from 'src/app/services/customer.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route } from '@angular/router';
import { CustomerInvoiceService } from 'src/app/services/customerinvoice.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { saveAs } from 'file-saver';
import { VatService } from 'src/app/services/vat.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-invoice-show',
  templateUrl: './invoice-show.component.html',
  styleUrls: ['./invoice-show.component.less'],
})
export class InvoiceShowComponent implements OnInit {
  invoice: any = {};
  invoiceItems: any[] = [];
  customer: any = {};
  vat: any = {};
  subtotal = 0;
  vatAmount = 0;
  total = 0;
  currentUser: any;

  constructor(
    private customerinvoiceService: CustomerInvoiceService,
    private customerService: CustomerService,
    private vatService: VatService,
    private route: ActivatedRoute,
    private message: NzMessageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const customerInvoiceId =
      this.route.snapshot.paramMap.get('customerinvoiceId');

    if (customerInvoiceId) {
      this.customerinvoiceService
        .getCustomerInvoiceById(customerInvoiceId)
        .subscribe(
          (response) => {
            this.invoice = response;
            this.invoiceItems = response.customerInvoiceLines;
            this.subtotal = response.subTotalAmount;
            this.vatAmount = response.vatAmount;
            this.total = response.totalAmount;
            this.customerService
              .getCustomerById(this.invoice.customer_id)
              .subscribe(
                (response) => {
                  this.customer = response;
                },
                (error) => {
                  console.error('Error fetching customer:', error);
                }
              );
            this.vatService.getVatById(this.invoice.vat_id).subscribe(
              (response) => {
                this.vat = response;
              },
              (error) => {
                console.error('Error fetching vat:', error);
              }
            );
          },
          (error) => {
            console.error('Error fetching invoice:', error);
          }
        );
        this.currentUser = this.authService.getUserInfo().username;
    }
  }

  printInvoice(invoiceId: string): void {
    this.customerinvoiceService.makePdfInvoice(invoiceId).subscribe(
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
        console.error('Error fetching the PDF', error);
      }
    );
  }

  printInvoicePdf(invoiceId: string): void {
    this.customerinvoiceService.makePdfInvoice(invoiceId).subscribe(
      (response: Blob) => {
        saveAs(response, `Invoice_${invoiceId}.pdf`);
      },
      (error) => {
        console.error('Error downloading the PDF', error);
      }
    );
  }

  emailInvoicePdf(customerInvoiceId: string): void {
    this.customerinvoiceService.emailInvoice(customerInvoiceId).subscribe({
      next: (response) => {
        this.message.success(response.message || 'Invoice emailed successfully');
      },
      error: (error) => {
        this.message.error(`Error sending invoice: ${error.error?.error || 'Unknown error'}`);
      },
    });
  }

}
