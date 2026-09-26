import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerInvoiceService } from 'src/app/services/customerinvoice.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-invoice-list',
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.less'],
})
export class InvoiceListComponent implements OnInit {
  total = 0;
  listOfInvoices: any[] = [];
  customersList: any[] = [];
  usersList: any[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;


  constructor(
    private invoiceService: CustomerInvoiceService,
    private router: Router,
    private message: NzMessageService,
    private location: Location,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadUsers();
    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, []);
  }
  loadCustomers() {
    this.invoiceService.getCustomers().subscribe((data: any) => {
      this.customersList = data.items;
    });
  }

  loadUsers() {
    this.invoiceService.getUsers().subscribe((data: any) => {
      this.usersList = data;
      console.log(this.usersList);
    });
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
    filters: Array<{ key: string; value: string[] }>
  ): void {
    this.loading = true;
    this.invoiceService
      .getCustomerInvoices(pageIndex, pageSize, sortField, sortOrder, filters)
      .subscribe(
        (response) => {
          this.loading = false;
          this.total = response.totalCount; // Set totalCount for pagination
          this.listOfInvoices = response; //reponseitem
        },
        (error) => {
          console.error('Error loading invoices:', error);
          this.loading = false;
        }
      );
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = currentSort?.key || null;
    const sortOrder = currentSort?.value || null;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
  }

  deleteInvoice(invoice: any): void {
    this.invoiceService
      .deleteCustomerInvoice(invoice.customerInvoiceId)
      .subscribe(
        () => {
          this.listOfInvoices = this.listOfInvoices.filter(
            (i) => i.customerInvoiceId !== invoice.customerInvoiceId
          );
          this.message.success('Invoice deleted successfully.');
          this.loadDataFromServer(
            this.pageIndex,
            this.pageSize,
            null,
            null,
            []
          );
        },
        (error) => {
          this.message.error('Failed to delete invoice.');
        }
      );
  }
  showDeleteConfirm(invoice: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this invoice?',
      nzContent: '<b style="color: red;">This action cannot be undone.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteInvoice(invoice),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel'),
    });
  }

  getCustomerName(customerId: string): string {
    const customer = this.customersList.find(
      (c) => c.customerId === customerId
    );
    return customer ? customer.name : 'Unknown';
  }

  getUserName(userId: string): string {
    const user = this.usersList.find((u) => u.userId === userId);
    return user ? user.username : 'Unknown';
  }

  // Navigate to the add invoice form
  addInvoice(): void {
    this.router.navigate(['/invoices/add']);
  }

  // Navigate to the edit invoice form with the selected invoice's ID
  editInvoice(invoiceId: string): void {
    this.router.navigate(['/invoices/edit', invoiceId]);
  }
  onBack(): void {
    this.location.back();
  }
}
