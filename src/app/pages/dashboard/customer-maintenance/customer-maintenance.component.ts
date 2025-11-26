import { OnInit, Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, finalize, forkJoin } from 'rxjs';

// Components & Services
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { CreateCarDialogComponent } from '../../dialog/create-car-dialog/create-car-dialog.component';
import { MaintenanceService } from '../../../services/maintenance.service';
import { VehicleService } from '../../../services/vehicle.service';
import { ModalService } from '../../modal/modal.service';
import { ToastService } from '../../toast/toast.service';

// --- [THÊM IMPORT NÀY] ---
import { ServiceDetailDialogComponent } from '../../dialog/service-detail-dialog/service-detail-dialog.component';
// -------------------------

// Models
import { MaintenanceHistory } from '../../../models/maintenance-history';

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
        private modal: ModalService,
        private toastService: ToastService
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
            .subscribe(({ history, vehicles }: any) => {
                this.maintenanceHistory = history?.content || [];
                console.log('Dữ liệu Maintenance History:', this.maintenanceHistory);
                this.totalItems = history?.page?.totalElements || 0;
                this.totalPageNum = history?.page?.totalPages || 0;
                this.hasCars = !!(vehicles && vehicles.length > 0);
            });
    }

    onSearch() {
        this.pageIndex = 0;
        this.currentPage = 1;
        this.loadData();
    }

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
                data: { title: 'Add Vehicle', message: '' },
                panelClass: ['modal-panel', 'p-0'],
                backdropClass: 'modal-backdrop',
                disableClose: false,
            });

            ref.afterClosed$.subscribe((confirmed: any) => {
                if (confirmed) {
                    this.loadData();
                }
            });
        }
    }

    // --- XỬ LÝ HỦY ĐƠN ---
    onCancelTicket(ticketId: number) {
        if (confirm('Are you sure you want to cancel this booking?')) {
            this.isLoading = true;

            this.maintenanceService.cancelTicket(ticketId).subscribe({
                next: (res: any) => {
                    this.toastService.success('Cancelled successfully!');
                    const item = this.maintenanceHistory.find(x => x.id === ticketId);
                    if (item) {
                        item.status = 'CANCELLED';
                    }
                    this.isLoading = false;
                },
                error: (err: any) => {
                    this.isLoading = false;
                    console.error(err);
                    const msg = err.error?.message || 'Failed to cancel appointment.';
                    this.toastService.error(msg);
                }
            });
        }
    }

    get totalPages(): number {
        return this.totalPageNum;
    }

    goToPage(page: number) {
        if (page < 1 || page > this.totalPages) return;
        this.pageIndex = page - 1;
        this.currentPage = page;
        this.loadData();
    }

    // --- HÀM XEM CHI TIẾT ---
    viewDetails(item: any) {
        const ref = this.modal.open(ServiceDetailDialogComponent, {
            data: {
                title: 'Maintenance Details',
                ticketId: item.id || item.bookingId,
                carModelId: item.carModelId,
                numOfKm: item.numOfKm,
                isReadOnly: true // Mode chỉ xem
            },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });
    }
}