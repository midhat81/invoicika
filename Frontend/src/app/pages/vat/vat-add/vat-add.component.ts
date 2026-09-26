import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { VatService } from 'src/app/services/vat.service'; // Adjusted for VAT service
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-vat-add',
  templateUrl: './vat-add.component.html',
  styleUrls: ['./vat-add.component.less'],
})
export class VatAddComponent {
  addVatForm: FormGroup;

  constructor(
    private fb: NonNullableFormBuilder,
    private vatService: VatService,
    private router: Router,
    private message: NzMessageService
  ) {
    this.addVatForm = this.fb.group({
      percentage: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]), // Percentage field
    });
  }

  submitForm(): void {
    if (this.addVatForm.valid) {
      const newVat = {
        ...this.addVatForm.value,
      };

      this.vatService.addVat(newVat).subscribe({
        next: () => {
          this.message.success('VAT added successfully');
          this.router.navigate(['/vat/all']); // Navigate back to VAT list
        },
        error: (err) => {
          this.message.error('Error adding VAT');
          console.error('Error adding VAT:', err);
        },
      });
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.addVatForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/vat/all']); // Navigate back to VAT list
  }
}
