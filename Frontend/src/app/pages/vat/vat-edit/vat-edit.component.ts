import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { VatService } from 'src/app/services/vat.service'; // Adjusted for VAT service
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-vat-edit',
  templateUrl: './vat-edit.component.html',
  styleUrls: ['./vat-edit.component.less']
})
export class VatEditComponent implements OnInit {
  editVatForm: FormGroup;
  vatId!: string;

  constructor(
    private fb: NonNullableFormBuilder,
    private vatService: VatService,
    private router: Router,
    private route: ActivatedRoute,
    private message: NzMessageService
  ) {
    this.editVatForm = this.fb.group({
      percentage: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]), // Percentage field
    });
  }

  ngOnInit(): void {
    this.vatId = this.route.snapshot.paramMap.get('vatId')!; // Fetch VAT ID from route
    this.vatService.getVatById(this.vatId).subscribe((vat) => {
      this.editVatForm.patchValue({
        percentage: vat.percentage, // Set the percentage value in the form
      });
    }, error => {
      this.message.error('Error loading VAT details');
    });
  }

  submitForm(): void {
    if (this.editVatForm.valid) {
      const updatedVat = {
        vatId: this.vatId,
        ...this.editVatForm.value
      };

      this.vatService.updateVat(this.vatId, updatedVat).subscribe({
        next: () => {
          this.message.success('VAT updated successfully');
          this.router.navigate(['/vat/all']); // Navigate back to VAT list
        },
        error: (err) => {
          this.message.error('Error updating VAT');
          console.error('Error updating VAT:', err);
        }
      });
    }
  }

  resetForm(e: MouseEvent): void {
    e.preventDefault();
    this.editVatForm.reset();
  }

  onBack(): void {
    this.router.navigate(['/vat/all']); // Navigate back to VAT list
  }
}
