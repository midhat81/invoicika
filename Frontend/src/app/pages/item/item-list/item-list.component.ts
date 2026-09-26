import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ItemService } from 'src/app/services/item.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-item-list',
  templateUrl: './item-list.component.html',
  styleUrls: ['./item-list.component.less']
})
export class ItemListComponent implements OnInit {
  total = 0;
  listOfItems: any[] = [];
  loading = true;
  pageSize = 10;
  pageIndex = 1;
  searchText: string | null = null;
  constructor(
    private itemService: ItemService,
    private location: Location,
    private message: NzMessageService,
    private router: Router,
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
    this.itemService.getItems(pageIndex, pageSize, sortField, sortOrder, filters, searchTerm).subscribe(response => {
      this.loading = false;
      this.total = response.totalCount;  // Set totalCount for pagination
      this.listOfItems = response.items;  // Set items array from the response
      this.searchText = '';
    }, error => {
      this.loading = false;
      this.message.error('Error loading items');
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    const { pageSize, pageIndex, sort, filter } = params;
    const currentSort = sort.find(item => item.value !== null);
    const sortField = currentSort?.key || null;
    const sortOrder = currentSort?.value || null;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter, this.searchText);
  }
  onSearch(): void {
    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, [], this.searchText);
  }

  deleteItem(item: any): void {
    this.itemService.deleteItem(item.itemId).subscribe(() => {
      this.listOfItems = this.listOfItems.filter(i => i.itemId !== item.itemId);
      this.message.success('Item deleted successfully');
      this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, [], null);
      this.router.navigate(['/items/all']);
    }, error => {
      this.message.error('Error deleting item');
    });
  }
  showDeleteConfirm(item: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this item?',
      nzContent: '<b style="color: red;">This action cannot be undone.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteItem(item),
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  onBack(): void {
    this.location.back();
  }
}
