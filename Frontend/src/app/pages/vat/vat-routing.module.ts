import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VatListComponent } from './vat-list/vat-list.component';
import { VatAddComponent } from './vat-add/vat-add.component';
import { VatEditComponent } from './vat-edit/vat-edit.component';

const routes: Routes = [
  { path: 'all', component: VatListComponent },
  { path: 'add', component: VatAddComponent },
  { path: 'edit/:vatId', component: VatEditComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VatRoutingModule {}
