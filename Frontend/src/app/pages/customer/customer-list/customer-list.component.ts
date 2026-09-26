import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.less'],
})
export class CustomerListComponent implements OnInit {
  total = 0;
  listOfCustomers: any[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  searchText: string | null = null;
  constructor(
    private customerService: CustomerService,
    private location: Location,
    private router: Router,
    private message: NzMessageService,
    private modal: NzModalService
  ) {}

  ngOnInit(): void {
    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, [], null);
  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
    filters: Array<{ key: string; value: string[] }>,
    searchTerm: string | null
  ): void {
    this.loading = true;
    if (this.searchText) {
      filters.push({ key: 'searchTerm', value: [this.searchText] });
    }
    this.customerService
      .getCustomers(pageIndex, pageSize, sortField, sortOrder, filters, searchTerm)
      .subscribe(
        (response) => {
          this.loading = false;
          this.total = response.totalCount; // Set totalCount for pagination
          this.listOfCustomers = response.items; // Set items array from the response
          this.searchText = '';
        },
        (error) => {
          console.error('Error loading customers:', error);
          this.loading = false;
        }
      );
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find((item) => item.value !== null);
    const sortField = currentSort?.key || null;
    const sortOrder = currentSort?.value || null;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter, this.searchText);
  }

  onSearch(): void {
    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, [], this.searchText);
  }

  deleteCustomer(customer: any): void {
    this.customerService.deleteCustomer(customer.customerId).subscribe(
      () => {
        this.listOfCustomers = this.listOfCustomers.filter(
          (c) => c.id !== customer.customerId
        );
        this.message.success('Customer deleted successfully.');
        this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, [], null);
        this.router.navigate(['/customers/all']);
      },
      (error) => {
        this.message.error('Failed to delete customer.');
      }
    );
  }

  showDeleteConfirm(customer: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this customer?',
      nzContent: '<b style="color: red;">This action cannot be undone.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteCustomer(customer),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  addCustomer(): void {
    this.router.navigate(['/customers/add']);
  }
  
  editCustomer(customerId: string): void {
    this.router.navigate(['/customers/edit', customerId]);
  }

  onBack(): void {
    this.location.back();
  }
}
