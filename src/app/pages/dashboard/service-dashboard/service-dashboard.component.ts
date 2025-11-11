import {Component, HostListener, OnInit, ChangeDetectorRef} from '@angular/core';
import {MaintenanceService} from "../../../services/maintenance.service";
import {MaintenanceTicket} from "../../../models/maintenance-ticket";
import {ModalService} from "../../modal/modal.service";
import {RenewDialogComponent} from "../../dialog/renew-dialog/renew-dialog.component";
import {ServiceDetailDialogComponent} from "../../dialog/service-detail-dialog/service-detail-dialog.component";
import {DatePipe, CommonModule} from "@angular/common";
import {ConfirmDialogComponent} from "../../dialog/confirm-dialog/confirm-dialog.component";

type OptionKey =
    | 'see_all'
    | 'category_A'
    | 'category_B'
    | 'newest'
    | 'oldest'
    | 'price_low_high'
    | 'price_high_low';

interface OptionItem {
    key: OptionKey;
    label: string;
}

@Component({
    selector: 'app-service-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe
    ],
    templateUrl: './service-dashboard.component.html',
    styleUrl: './service-dashboard.component.css'
})
export class ServiceDashboardComponent implements OnInit {

    tickets: MaintenanceTicket[] = [];
    open = false;

    options: OptionItem[] = [
        { key: 'see_all', label: 'See all' },
        { key: 'category_A', label: 'Category: A' },
        { key: 'category_B', label: 'Category: B' },
        { key: 'newest', label: 'Sort by: Newest first' },
    ];

    constructor(
        private maintenanceService: MaintenanceService,
        private modal: ModalService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.initTicket();
    }

    initTicket(): void {
      this.maintenanceService.getAll().subscribe({
        next: (rs) => {
          this.tickets = [...rs]; // clone lại mảng -> trigger change detection
          this.cdr.detectChanges(); // ép render lại
        },
        error: (err) => console.error('Error loading tickets:', err)
      });
    }

    // ----------------------- Filter Dropdown -----------------------

    selected = new Set<OptionKey>();

    toggleDropdown(e: MouseEvent): void {
        e.stopPropagation();
        this.open = !this.open;
    }

    @HostListener('document:click')
    onDocClick(): void {
        this.open = false;
    }

    isChecked(key: OptionKey): boolean {
        return this.selected.has(key);
    }

    toggle(key: OptionKey, ev: Event): void {
        const input = ev.target as HTMLInputElement;
        if (input.checked) this.selected.add(key);
        else this.selected.delete(key);
    }

    selectAll(): void {
        this.options.forEach(o => this.selected.add(o.key));
    }

    clearAll(): void {
        this.selected.clear();
    }

    apply(): void {
        if (this.selected.has('see_all')) {
            this.handleSeeAll();
        }
        const cats = ['category_A', 'category_B'].filter(k => this.selected.has(k as OptionKey));
        if (cats.length) {
            this.handleFilterByCategories(cats as OptionKey[]);
        }
        if (this.selected.has('newest')) this.sortByDate('desc');
        else if (this.selected.has('oldest')) this.sortByDate('asc');
        if (this.selected.has('price_low_high')) this.sortByPrice('asc');
        else if (this.selected.has('price_high_low')) this.sortByPrice('desc');
        this.open = false;
    }

    handleSeeAll(): void {}
    handleFilterByCategories(keys: OptionKey[]): void {}
    sortByDate(dir: 'asc' | 'desc'): void {}
    sortByPrice(dir: 'asc' | 'desc'): void {}

    // ----------------------- Business Logic -----------------------

    getService(item: MaintenanceTicket):
        'Bảo dưỡng & Sửa chữa' | 'Bảo dưỡng' | 'Sửa chữa' | undefined {
        if (item.isMaintenance && item.isRepair) return 'Bảo dưỡng & Sửa chữa';
        if (item.isMaintenance) return 'Bảo dưỡng';
        if (item.isRepair) return 'Sửa chữa';
        return undefined;
    }

    getStatus(status: string):
        'Mới' | 'Đang thực hện' | 'Thực hiện xong' | 'Hoàn thành' | undefined {
        switch (status) {
            case 'CUSTOMER_SUBMITTED': return 'Mới';
            case 'TECHNICIAN_RECEIVED': return 'Đang thực hện';
            case 'TECHNICIAN_COMPLETED': return 'Thực hiện xong';
            case 'DONE': return 'Hoàn thành';
        }
        return undefined;
    }

    onDetail(ticketId: number, carModelId: number, numOfKm: number, technicianId: number, milestoneId: number): void {
        const ref = this.modal.open(ServiceDetailDialogComponent, {
            data: { title: 'Đặt lịch', message: '', carModelId, numOfKm, ticketId, technicianId, milestoneId },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) this.initTicket();
        });
    }

    onComplete(orderId: number): void {
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
            data: { message: 'Bạn có chắc muốn đánh dấu phiếu này là Hoàn thành?', isConfirm: true },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });

        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.completeTechnicianTask(orderId).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, {
                            data: { message: 'Phiếu đã được đánh dấu Hoàn thành.', isConfirm: false }
                        });
                        this.initTicket(); // load lại danh sách
                    },
                    error: (err) => console.error('Error updating status:', err)
                });
            }
        });
    }

    onCancel(orderId: number): void {
      const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
        data: { message: 'Are you sure you want to cancel this order?', isConfirm: true },
      });

      confirmDialogRef.afterClosed$.subscribe(confirmed => {
        if (confirmed) {
          this.maintenanceService.cancelOrder(orderId).subscribe({
            next: () => {
              this.modal.open(ConfirmDialogComponent, {
                data: { message: 'The order has been successfully cancelled.', isConfirm: false }
              });
              // ⏳ chờ modal đóng xong mới reload list
              setTimeout(() => {
                this.initTicket();
                this.cdr.markForCheck(); // ép render lại
              }, 250);
            },
            error: (err) => console.error('Cancel error:', err)
          });
        }
      });
    }

    onReopen(orderId: number): void {
      const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
        data: { message: 'Are you sure you want to reactivate this order?', isConfirm: true },
      });

      confirmDialogRef.afterClosed$.subscribe(confirmed => {
        if (confirmed) {
          this.maintenanceService.reopenOrder(orderId).subscribe({
            next: () => {
              this.modal.open(ConfirmDialogComponent, {
                data: { message: 'The order has been successfully reactivated.', isConfirm: false }
              });
              // ⏳ chờ modal dispose rồi reload list
              setTimeout(() => {
                this.initTicket();
                this.cdr.markForCheck();
              }, 250);
            },
            error: (err) => console.error('Reopen error:', err)
          });
        }
      });
    }


    trackByKey(index: number, item: any): string {
      return item.key;
    }

}
