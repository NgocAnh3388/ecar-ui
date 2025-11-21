import {Component, HostListener, OnInit, ChangeDetectorRef} from '@angular/core';
import {MaintenanceService} from "../../../services/maintenance.service";
import {MaintenanceTicket} from "../../../models/maintenance-ticket";
import {ModalService} from "../../modal/modal.service";
import {RenewDialogComponent} from "../../dialog/renew-dialog/renew-dialog.component";
import {ServiceDetailDialogComponent} from "../../dialog/service-detail-dialog/service-detail-dialog.component";
import {DatePipe, CommonModule} from "@angular/common";
import {ConfirmDialogComponent} from "../../dialog/confirm-dialog/confirm-dialog.component";
import { AuthService } from '../../../services/auth.service';

type OptionKey =
    | 'STATUS_SUBMITTED'
    | 'STATUS_RECEIVED'
    | 'STATUS_COMPLETED'
    | 'SORT_DATE_NEWEST'
    | 'SORT_DATE_OLDEST';

interface OptionItem {
    key: OptionKey;
    label: string;
    isSort?: boolean;
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

    allTickets: MaintenanceTicket[] = [];
    tickets: MaintenanceTicket[] = [];
    open = false;

    options: OptionItem[] = [
        { key: 'STATUS_SUBMITTED', label: 'Status: New' },
        { key: 'STATUS_RECEIVED', label: 'Status: In Progress' },
        { key: 'STATUS_COMPLETED', label: 'Status: Completed' },
        { key: 'SORT_DATE_NEWEST', label: 'Sort by: Newest first', isSort: true },
        { key: 'SORT_DATE_OLDEST', label: 'Sort by: Oldest first', isSort: true },
    ];

    constructor(
        private maintenanceService: MaintenanceService,
        private modal: ModalService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService  // ← Inject AuthService
    ) {}

    ngOnInit(): void {
        this.initTicket();
    }

    initTicket(): void {
        // Sử dụng hasRole() thay vì so sánh trực tiếp
        const apiCall = this.authService.hasRole('ROLE_TECHNICIAN')
            ? this.maintenanceService.getMyTasks()
            : this.maintenanceService.getAll();

        apiCall.subscribe({
            next: (rs) => {
                this.allTickets = [...rs];
                this.tickets = [...rs];
                this.cdr.detectChanges();
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
        this.tickets = [...this.allTickets]; // Reset lại danh sách hiển thị
    }

    apply(): void {
        let filteredTickets = [...this.allTickets]; // Luôn bắt đầu từ danh sách gốc

        // 1. Lọc theo trạng thái
        const statusFilters: string[] = [];
        if (this.selected.has('STATUS_SUBMITTED')) statusFilters.push('CUSTOMER_SUBMITTED');
        if (this.selected.has('STATUS_RECEIVED')) statusFilters.push('TECHNICIAN_RECEIVED');
        if (this.selected.has('STATUS_COMPLETED')) statusFilters.push('TECHNICIAN_COMPLETED');

        if (statusFilters.length > 0) {
            filteredTickets = filteredTickets.filter(ticket => statusFilters.includes(ticket.status));
        }

        // 2. Sắp xếp theo ngày hẹn
        if (this.selected.has('SORT_DATE_NEWEST')) {
            filteredTickets.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());
        } else if (this.selected.has('SORT_DATE_OLDEST')) {
            filteredTickets.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        }

        this.tickets = filteredTickets; // Cập nhật danh sách hiển thị
        this.open = false;
    }

    handleSeeAll(): void {}
    handleFilterByCategories(keys: OptionKey[]): void {}
    sortByDate(dir: 'asc' | 'desc'): void {}
    sortByPrice(dir: 'asc' | 'desc'): void {}

    // ----------------------- Business Logic -----------------------

    getService(item: MaintenanceTicket):
        'Maintenance & Repair' | 'Maintenance' | 'Repair' | undefined {
        if (item.isMaintenance && item.isRepair) return 'Maintenance & Repair';
        if (item.isMaintenance) return 'Maintenance';
        if (item.isRepair) return 'Repair';
        return undefined;
    }

    getStatus(status: string):
        'New' | 'In Progress' | 'Completed' | 'Done' | undefined {
        switch (status) {
            case 'CUSTOMER_SUBMITTED': return 'New';
            case 'TECHNICIAN_RECEIVED': return 'In Progress';
            case 'TECHNICIAN_COMPLETED': return 'Completed';
            case 'DONE': return 'Done';
        }
        return undefined;
    }

    onDetail(ticketId: number, carModelId: number, numOfKm: number, technicianId: number, milestoneId: number): void {
        const ref = this.modal.open(ServiceDetailDialogComponent, {
            data: { title: 'Schedule Service', message: '', carModelId, numOfKm, ticketId, technicianId, milestoneId },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) this.initTicket();
        });
    }

    onComplete(orderId: number): void {
        // 1. Mở dialog xác nhận
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
            data: {
                message: 'Are you sure you want to mark this task as completed?',
                isConfirm: true
            },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });

        // 2. Lắng nghe kết quả từ dialog
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            // Chỉ thực hiện nếu người dùng nhấn "Confirm" (confirmed === true)
            if (confirmed) {
                this.maintenanceService.completeTechnicianTask(orderId).subscribe({
                    next: (updatedOrder) => {
                        // Cập nhật giao diện bằng cách lọc bỏ mục đã hoàn thành
                        this.tickets = this.tickets.filter(ticket => ticket.id !== orderId);

                        // Mở dialog thông báo thành công
                        this.modal.open(ConfirmDialogComponent, {
                            data: {
                                message: 'Status updated successfully!',
                                isConfirm: false // Chỉ có nút OK
                            }
                        });
                        this.initTicket();
                    },
                    error: (err) => {
                        // SỬA LẠI DÒNG NÀY
                        console.error('Error updating status:', err);

                        // Mở dialog thông báo lỗi
                        this.modal.open(ConfirmDialogComponent, {
                            data: {
                                message: 'An error occurred. Please try again.',
                                isConfirm: false // Chỉ có nút OK
                            }
                        });
                    }
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
