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
import { VehicleService } from '../../../services/vehicle.service'; // ✅ Thêm service này

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
  styleUrls: ['./customer-maintenance.component.css']
})
export class CustomerMaintenanceComponent implements OnInit {
  searchValue = '';
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;
  totalPageNum = 0;
  currentPage = this.pageIndex + 1;
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

  /** ✅ Load song song lịch sử + danh sách xe */
  loadData() {
    this.isLoading = true;

    forkJoin({
      history: this.maintenanceService
        .getMaintenanceHistory(this.searchValue, this.pageSize, this.pageIndex)
        .pipe(catchError(() => EMPTY)), // ✅ Nếu lỗi, trả về EMPTY
      vehicles: this.vehicleService.getVehicles().pipe(catchError(() => EMPTY))
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ history, vehicles }) => {
        console.log('History API:', history);
        console.log('Vehicles API:', vehicles);

        // ✅ Xử lý dữ liệu lịch sử
        this.maintenanceHistory = history?.content || [];
        this.totalItems = history?.page?.totalElements || 0;
        this.totalPageNum = history?.page?.totalPages || 0;

        // ✅ Xử lý dữ liệu xe
        this.hasCars = !!(vehicles && vehicles.length > 0);

        console.log('Đã gán xong, history:', this.maintenanceHistory);
      });
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
    this.pageIndex = page - 1;
    this.loadData();
    this.currentPage = page;
  }

  getBadgeColor(status: string): 'success' | 'warning' | 'error' {
    if (status === 'Delivered') return 'success';
    if (status === 'Pending') return 'warning';
    return 'error';
  }
}
