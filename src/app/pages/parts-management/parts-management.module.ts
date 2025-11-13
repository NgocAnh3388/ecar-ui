import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PartsManagementRoutingModule } from './parts-management-routing.module';
import { PartsManagementComponent } from './parts-management/parts-management.component';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        PartsManagementRoutingModule,
        PartsManagementComponent
    ],
})
export class PartsManagementModule {}
