import {Component, HostListener, OnInit} from '@angular/core';
import {MaintenanceService} from "../../../services/maintenance.service";
import {MaintenanceTicket} from "../../../models/maintenance-ticket";
import {ModalService} from "../../modal/modal.service";
import {RenewDialogComponent} from "../../dialog/renew-dialog/renew-dialog.component";
import {ServiceDetailDialogComponent} from "../../dialog/service-detail-dialog/service-detail-dialog.component";
import {CommonModule, DatePipe} from "@angular/common";
import { ConfirmDialogComponent } from '../../dialog/confirm-dialog/confirm-dialog.component';


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
        DatePipe,
        CommonModule
    ],
  templateUrl: './service-dashboard.component.html',
  styleUrl: './service-dashboard.component.css'
})
export class ServiceDashboardComponent implements OnInit {

    tickets: MaintenanceTicket[] = []
    open = false;

    options: OptionItem[] = [
        { key: 'see_all',         label: 'See all' },
        { key: 'category_A',      label: 'Category: A' },
        { key: 'category_B',      label: 'Category: B' },
        { key: 'newest',          label: 'Sort by: Newest first' },
    ];

    constructor(private maintenanceService: MaintenanceService,
                private modal: ModalService,) {
    }

    ngOnInit(): void {
        this.initTicket();
    }

    initTicket() {
        this.maintenanceService.getAll().pipe().subscribe(
            rs => {
                this.tickets = rs;
            }
        );
    }

    handleFilter() {
        console.log('Filter clicked');
        // Add your filter logic here
    }

    handleSeeAll() {
        console.log('See all clicked');
        // Add your see all logic here
    }

    /** Tập các option đang chọn */
    selected = new Set<OptionKey>();

    toggleDropdown(e: MouseEvent) {
        e.stopPropagation();
        this.open = !this.open;
    }

    @HostListener('document:click')
    onDocClick() {
        this.open = false;
    }

    isChecked(key: OptionKey): boolean {
        return this.selected.has(key);
    }

    toggle(key: OptionKey, ev: Event) {
        const input = ev.target as HTMLInputElement;
        if (input.checked) this.selected.add(key);
        else this.selected.delete(key);
    }

    selectAll() {
        this.options.forEach(o => this.selected.add(o.key));
    }

    clearAll() {
        this.selected.clear();
    }

    /** Map các lựa chọn sang hành vi nghiệp vụ của bạn */
    apply() {
        // Ví dụ: ưu tiên See all nếu được chọn
        if (this.selected.has('see_all')) {
            this.handleSeeAll();
        }

        // Lọc theo category
        const cats = ['category_A', 'category_B'].filter(k => this.selected.has(k as OptionKey));
        if (cats.length) {
            this.handleFilterByCategories(cats as OptionKey[]);
        }

        // Sắp xếp
        if (this.selected.has('newest')) this.sortByDate('desc');
        else if (this.selected.has('oldest')) this.sortByDate('asc');

        if (this.selected.has('price_low_high')) this.sortByPrice('asc');
        else if (this.selected.has('price_high_low')) this.sortByPrice('desc');

        this.open = false;
    }


    handleFilterByCategories(keys: OptionKey[]) {
        // ... lọc theo nhiều category (A/B) tuỳ app của bạn
        // gợi ý: emit ra store/service hoặc set state rồi reload list
    }

    sortByDate(dir: 'asc' | 'desc') {
        // ... sắp xếp theo ngày
    }

    sortByPrice(dir: 'asc' | 'desc') {
        // ... sắp xếp theo giá
    }

    getService(item: MaintenanceTicket): 'Bảo dưỡng & Sửa chữa' | 'Bảo dưỡng' | 'Sửa chữa' | undefined {
        if (item.isMaintenance && item.isRepair) {
            return 'Bảo dưỡng & Sửa chữa'
        } else if (item.isMaintenance) {
            return 'Bảo dưỡng'
        } else if (item.isRepair) {
            return 'Sửa chữa'
        }
        return undefined;
    }

    getStatus(status: string): 'Mới' | 'Đang thực hiện' | 'Thực hiện xong' | 'Hoàn thành' | undefined {
        switch (status) {
            case 'CUSTOMER_SUBMITTED':
                return 'Mới';
            case 'TECHNICIAN_RECEIVED':
                return 'Đang thực hiện';
            case 'TECHNICIAN_COMPLETED':
                return 'Thực hiện xong';
            case 'DONE':
                return 'Hoàn thành'
        }
        return undefined;
    }

    onDetail(ticketId:number, carModelId: number, numOfKm: number, technicianId: number,) {
        const ref = this.modal.open(ServiceDetailDialogComponent, {
            data: { title: 'Đặt lịch', message: '', carModelId:  carModelId, numOfKm: numOfKm, ticketId: ticketId, technicianId: technicianId },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.initTicket();
            }
        });
    }

    onComplete(orderId: number): void {
        // 1. Mở dialog xác nhận (bằng tiếng Anh)
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
            data: {
                message: 'Are you sure you want to mark this task as completed?',
                isConfirm: true
            },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });

        // 2. Lắng nghe kết quả
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.completeTechnicianTask(orderId).subscribe({
                    next: (updatedOrder) => {
                        // Lọc mảng để loại bỏ mục vừa hoàn thành
                        this.tickets = this.tickets.filter(ticket => ticket.id !== orderId);

                        // Mở dialog thông báo THÀNH CÔNG (bằng tiếng Anh)
                        this.modal.open(ConfirmDialogComponent, {
                            data: {
                                message: 'Status updated successfully!',
                                isConfirm: false // Chỉ có nút OK
                            }
                        });
                    },
                    error: (err) => {
                        console.error('Error updating status:', err);
                        // Mở dialog thông báo LỖI (bằng tiếng Anh)
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
}
