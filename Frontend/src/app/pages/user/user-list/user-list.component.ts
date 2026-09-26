import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Router } from '@angular/router';
import { RoleService } from 'src/app/services/role.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.less'],
})
export class UserListComponent implements OnInit {
  listOfUsers: any[] = [];
  loading = false;
  pageSize = 10;
  pageIndex = 1;
  total = 0;
  basePath: string;


  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private message: NzMessageService,
    private router: Router,
    private modal: NzModalService,
  ) {
    this.basePath = environment.apiUrl.replace('/api/', '');
  }

  ngOnInit(): void {
    this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, []);

  }

  loadDataFromServer(
    pageIndex: number,
    pageSize: number,
    sortField: string | null,
    sortOrder: string | null,
    filters: any[]
  ): void {
    this.loading = true;
    this.userService
      .getUsers(pageIndex, pageSize, sortField, sortOrder, filters)
      .subscribe(
        (response) => {
          this.loading = false;
          this.total = response.totalCount;
          this.listOfUsers = response;
        },
        (error) => {
          this.message.error('Error loading users');
          this.loading = false;
        }
      );
  }

  deleteUser(user: any): void {
    this.userService.deleteUser(user.userId).subscribe(
      () => {
        this.message.success('User deleted successfully');
        this.loadDataFromServer(this.pageIndex, this.pageSize, null, null, []);
        this.router.navigate(['/users/all']);
      },
      (error) => {
        this.message.error('Error deleting user');
      }
    );
  }
  showDeleteConfirm(user: any): void {
    this.modal.confirm({
      nzTitle: 'Are you sure you want to delete this user?',
      nzContent: '<b style="color: red;">This action cannot be undone.</b>',
      nzOkText: 'Yes',
      nzOkType: 'primary',
      nzOkDanger: true,
      nzOnOk: () => this.deleteUser(user), // Call deleteUser if confirmed
      nzCancelText: 'No',
      nzOnCancel: () => console.log('Cancel')
    });
  }

  onQueryParamsChange(params: any): void {
    const { pageIndex, pageSize, sortField, sortOrder, filter } = params;
    this.loadDataFromServer(pageIndex, pageSize, sortField, sortOrder, filter);
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }

}
