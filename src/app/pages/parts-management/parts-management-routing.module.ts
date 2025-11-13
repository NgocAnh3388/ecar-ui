import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PartsManagementComponent } from './parts-management/parts-management.component';

const routes: Routes = [
  {
    path: '',
    component: PartsManagementComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PartsManagementRoutingModule {}
