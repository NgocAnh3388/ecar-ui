import { OnInit, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { MaintenanceService } from '../../../services/maintenance.service';
import { MaintenanceHistory } from '../../../models/maintenance-history';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { catchError, EMPTY, finalize, forkJoin } from 'rxjs';
import { NgClass } from '@angular/common';
import { Router } from '@angular/router';
import { ModalService } from '../../modal/modal.service';
import { CreateCarDialogComponent } from '../../dialog/create-car-dialog/create-car-dialog.component';
import { VehicleService } from '../../../services/vehicle.service';

@Component({
    selector: 'app-customer-maintenance',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BadgeComponent,
        ButtonComponent,
        NgClass
    ],
    templateUrl: './customer-maintenance.component.html',
    styleUrl: './customer-maintenance.component.css'
})
export class CustomerMaintenanceComponent implements OnInit {
    // Expose Math object to template
    Math = Math;

    searchValue = '';
    pageSize = 10;
    pageIndex = 0;
    totalItems = 0;
    totalPageNum = 0;
    currentPage = 1;
    maintenanceHistory: MaintenanceHistory[] = [];
    isLoading = false;
    hasCars = false;

    constructor(
        private maintenanceService: MaintenanceService,
        private vehicleService: VehicleService,
        private router: Router,
        private modal: ModalService
    ) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;

        forkJoin({
            history: this.maintenanceService
                .getMaintenanceHistory(this.searchValue, this.pageSize, this.pageIndex)
                .pipe(catchError((error) => {
                    console.error('Error loading history:', error);
                    return EMPTY;
                })),
            vehicles: this.vehicleService
                .getVehicles()
                .pipe(catchError((error) => {
                    console.error('Error loading vehicles:', error);
                    return EMPTY;
                }))
        })
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(({ history, vehicles }) => {
                console.log('History API:', history);
                console.log('Vehicles API:', vehicles);

                this.maintenanceHistory = history?.content || [];
                this.totalItems = history?.page?.totalElements || 0;
                this.totalPageNum = history?.page?.totalPages || 0;
                this.hasCars = !!(vehicles && vehicles.length > 0);

                console.log('Maintenance History:', this.maintenanceHistory);
                console.log('Total Items:', this.totalItems);
                console.log('Has Cars:', this.hasCars);
            });
    }

    // Search function - triggered when user presses Enter or clicks search
    onSearch() {
        console.log('Searching for:', this.searchValue);
        // Reset to first page when searching
        this.pageIndex = 0;
        this.currentPage = 1;
        this.loadData();
    }

    // Clear search
    clearSearch() {
        this.searchValue = '';
        this.pageIndex = 0;
        this.currentPage = 1;
        this.loadData();
    }

    handleEmptyAction() {
        if (this.hasCars) {
            this.router.navigate(['/customer-schedule']);
        } else {
            const ref = this.modal.open(CreateCarDialogComponent, {
                data: { title: 'Thêm xe', message: '' },
                panelClass: ['modal-panel', 'p-0'],
                backdropClass: 'modal-backdrop',
                disableClose: false,
            });

            ref.afterClosed$.subscribe((confirmed) => {
                if (confirmed) {
                    this.loadData();
                }
            });
        }
    }

    get totalPages(): number {
        return this.totalPageNum;
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) {
            return;
        }
        this.pageIndex = page - 1;
        this.currentPage = page;
        this.loadData();
    }

    // Navigation helpers
    goToFirstPage() {
        this.goToPage(1);
    }

    goToLastPage() {
        this.goToPage(this.totalPages);
    }

    // Check if page is current
    isCurrentPage(page: number): boolean {
        return this.currentPage === page;
    }

    getBadgeColor(status: string): 'success' | 'warning' | 'error' {
        if (status === 'Delivered') return 'success';
        if (status === 'Pending') return 'warning';
        return 'error';
    }
}