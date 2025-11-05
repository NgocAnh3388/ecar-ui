import {AfterViewInit, Component} from '@angular/core';
import {BadgeComponent} from "../../../shared/components/ui/badge/badge.component";
import {VehicleService} from "../../../services/vehicle.service";
import {Vehicle} from "../../../models/vehicle";
import {catchError, EMPTY, finalize} from "rxjs";
import {DatePipe, DecimalPipe, NgClass} from "@angular/common";
import {MaintenanceHistory} from "../../../models/maintenance-history";
import {MaintenanceService} from "../../../services/maintenance.service";
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {ModalService} from "../../modal/modal.service";
import {MaintenanceDialogComponent} from "../../dialog/maintenance-dialog/maintenance-dialog.component";
import {CreateCarDialogComponent} from "../../dialog/create-car-dialog/create-car-dialog.component";

@Component({
  selector: 'app-customer-dashboard',
    imports: [
        BadgeComponent,
        DatePipe,
        DecimalPipe,
        ButtonComponent,
        NgClass
    ],
  templateUrl: './customer-dashboard.component.html',
  styleUrl: './customer-dashboard.component.css'
})
export class CustomerDashboardComponent implements AfterViewInit {
    searchValue = '';
    pageSize = 10;
    pageIndex = 0;
    totalItems = 0;
    totalPageNum = 0;
    currentPage = this.pageIndex + 1;
    vehicleData: Vehicle[] = []
    maintenanceHistory: MaintenanceHistory[] = []

    constructor(private vehicleService: VehicleService,
                private maintenanceService: MaintenanceService,
                private modal: ModalService) {

    }

    ngAfterViewInit() {
        this.getVehicleData();
        this.getHistoryData(0);
    }

    getVehicleData() {
        this.vehicleService.getVehicles().pipe(
            finalize(() => {}),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.vehicleData = res;
        });

    }

    getHistoryData(pageIndex: number) {
        this.maintenanceService.getMaintenanceHistory(this.searchValue, this.pageSize, pageIndex).pipe(
            finalize(() => {}),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.maintenanceHistory = res.content;
            this.totalItems = res.page.totalElements;
            this.totalPageNum = res.page.totalPages;
        });

    }

    getBadgeColor(status: string): 'success' | 'warning' | 'error' {
        if (status === 'Delivered') return 'success';
        if (status === 'Pending') return 'warning';
        return 'error';
    }

    get totalPages(): number {
        return this.totalPageNum;
    }

    goToPage(page: number) {
        this.getHistoryData(page - 1);
        this.currentPage = page;
    }

    schedule(id: number) {
        const ref = this.modal.open(MaintenanceDialogComponent, {
            data: { title: 'Đặt lịch', message: '', vehicle: this.vehicleData.find(v => v.id === id) },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.getHistoryData(this.pageIndex);
            }
        });
    }

    addVehicle() {
        const ref = this.modal.open(CreateCarDialogComponent, {
            data: { title: 'Thêm xe', message: '' },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.getVehicleData();
            }
        });
    }
}
