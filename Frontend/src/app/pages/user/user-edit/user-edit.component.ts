import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { RoleService } from 'src/app/services/role.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.less'],
})
export class UserEditComponent implements OnInit {
  editUserForm: FormGroup;
  userId!: string;
  roles: any[] = [];
  selectedFile: File | null = null;
  selectedFilePreview: File | null = null;
  photoUrl: string | null = null;
  loading = true;
  basePath: string;
  constructor(
    private fb: NonNullableFormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.editUserForm = this.fb.group({
      username: new FormControl<string | null>(null, [Validators.required]),
      emailAddress: new FormControl<string | null>(null, [
        Validators.required,
        Validators.email,
      ]),
      role_id: new FormControl<string | null>(null, [Validators.required]),
      photoUrl: new FormControl<string | null>(null),
      passwordHash: new FormControl<string | null>(null),
    });
    this.basePath = environment.apiUrl.replace('/api/', '');
  }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('userId')!;
    this.loadRoles();
    this.loadUser();
  }

  loadRoles(): void {
    this.roleService.getRoles().subscribe(
      (roles) => {
        this.roles = roles;
        this.loadUser(); // Fetch user details after roles are loaded
      },
      (error) => {
        console.error('Error fetching roles', error);
        this.loading = false; // Set loading to false on error
      }
    );
  }

  loadUser(): void {
    this.userService.getUserById(this.userId).subscribe(
      (user) => {
        this.editUserForm.patchValue({
          username: user.username,
          emailAddress: user.emailAddress,
          role_id: user.role_id,
          photoUrl: user.photoUrl,
        });
        this.photoUrl = user.photoUrl; // Display existing photo
        this.loading = false; // Set loading to false once user details are loaded
      },
      (error) => {
        this.message.error('Error loading user details');
        this.loading = false; // Set loading to false on error
      }
    );
  }
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedFilePreview = e.target.result; // Store the preview URL
      };
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = null;
      this.selectedFilePreview = null; // Reset preview if no file is selected
    }
  }


  submitForm(): void {
    if (this.editUserForm.valid) {
      const formData = new FormData();
      formData.append('userId', this.userId);
      Object.keys(this.editUserForm.controls).forEach((key) => {
        const control = this.editUserForm.get(key);
        if (control) {
          formData.append(key, control.value);
        }
      });

      if (this.selectedFile) {
        formData.append('photo', this.selectedFile);
      }

      this.userService.updateUser(this.userId, formData).subscribe({
        next: () => {
          this.message.success('User updated successfully');
          this.router.navigate(['/users/all']);
        },
        error: (err) => {
          this.message.error('Error updating user');
          console.error('Error updating user:', err);
        },
      });
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.editUserForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/users/all']);
  }
}
