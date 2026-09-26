import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { RoleService } from 'src/app/services/role.service'; // Adjust the path accordingly
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-role-list',
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.less'],
})
export class RoleListComponent implements OnInit {
  roles: any[] = [];
  loading = true;

  constructor(
    private roleService: RoleService,
    private location: Location,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.message.error('Failed to load roles');
        console.error(err);
      },
    });
  }

  onBack(): void {
    this.location.back();
  }
}
