import {Component, HostListener, OnInit, ChangeDetectorRef} from '@angular/core';
import {MaintenanceService} from "../../../services/maintenance.service";
import {MaintenanceTicket} from "../../../models/maintenance-ticket";
import {ModalService} from "../../modal/modal.service";
import {ServiceDetailDialogComponent} from "../../dialog/service-detail-dialog/service-detail-dialog.component";
import {DatePipe, CommonModule} from "@angular/common";
import {ConfirmDialogComponent} from "../../dialog/confirm-dialog/confirm-dialog.component";
import { AuthService } from '../../../services/auth.service';
import { ReportCostDialogComponent } from "../../dialog/report-cost-dialog/report-cost-dialog.component";
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
        // Lưu ý: ReportCostDialogComponent không cần import vào đây nếu bạn dùng ModalService mở động.
        // Nhưng nếu bạn dùng trong template thì phải import.
        // Ở đây bạn dùng modal.open() nên không cần import vào mảng này, chỉ cần import file ở trên đầu là đủ.
    ],
    templateUrl: './service-dashboard.component.html',
    styleUrl: './service-dashboard.component.css'
})
export class ServiceDashboardComponent implements OnInit {

    allTickets: MaintenanceTicket[] = [];
    tickets: MaintenanceTicket[] = [];
    open = false;
    isStaff: boolean = false;

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
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.isStaff = this.authService.getRoles().includes('ROLE_STAFF');
        this.initTicket();
    }

    initTicket(): void {
        const apiCall = this.authService.hasRole('ROLE_TECHNICIAN')
            ? this.maintenanceService.getMyTasks()
            : this.maintenanceService.getAll();

        apiCall.subscribe({
            next: (rs: any) => {
                this.allTickets = [...rs];
                this.tickets = [...rs];
                this.cdr.detectChanges();
            },
            error: (err: any) => console.error('Error loading tickets:', err)
        });
    }

    // --- Filter Logic ---
    selected = new Set<OptionKey>();
    toggleDropdown(e: MouseEvent): void { e.stopPropagation(); this.open = !this.open; }
    @HostListener('document:click') onDocClick(): void { this.open = false; }
    isChecked(key: OptionKey): boolean { return this.selected.has(key); }
    toggle(key: OptionKey, ev: Event): void { const input = ev.target as HTMLInputElement; if (input.checked) this.selected.add(key); else this.selected.delete(key); }
    selectAll(): void { this.options.forEach(o => this.selected.add(o.key)); }
    clearAll(): void { this.selected.clear(); this.tickets = [...this.allTickets]; }
    apply(): void {
        let filteredTickets = [...this.allTickets];
        const statusFilters: string[] = [];
        if (this.selected.has('STATUS_SUBMITTED')) statusFilters.push('CUSTOMER_SUBMITTED');
        if (this.selected.has('STATUS_RECEIVED')) statusFilters.push('TECHNICIAN_RECEIVED');
        if (this.selected.has('STATUS_COMPLETED')) statusFilters.push('TECHNICIAN_COMPLETED');
        if (statusFilters.length > 0) filteredTickets = filteredTickets.filter(ticket => statusFilters.includes(ticket.status));
        if (this.selected.has('SORT_DATE_NEWEST')) filteredTickets.sort((a, b) => new Date(b.scheduleDate).getTime() - new Date(a.scheduleDate).getTime());
        else if (this.selected.has('SORT_DATE_OLDEST')) filteredTickets.sort((a, b) => new Date(a.scheduleDate).getTime() - new Date(b.scheduleDate).getTime());
        this.tickets = filteredTickets;
        this.open = false;
    }
    handleSeeAll(): void {}
    handleFilterByCategories(keys: OptionKey[]): void {}
    sortByDate(dir: 'asc' | 'desc'): void {}
    sortByPrice(dir: 'asc' | 'desc'): void {}

    // --- Helpers ---
    getService(item: MaintenanceTicket): 'Maintenance & Repair' | 'Maintenance' | 'Repair' | undefined {
        if (item.isMaintenance && item.isRepair) return 'Maintenance & Repair';
        if (item.isMaintenance) return 'Maintenance';
        if (item.isRepair) return 'Repair';
        return undefined;
    }

    getStatus(status: string): 'New' | 'In Progress' | 'Completed' | 'Done' | undefined {
        switch (status) {
            case 'CUSTOMER_SUBMITTED': return 'New';
            case 'TECHNICIAN_RECEIVED': return 'In Progress';
            case 'TECHNICIAN_COMPLETED': return 'Completed';
            case 'DONE': return 'Done';
        }
        return undefined;
    }

    onDetail(ticketId: number, carModelId: number, numOfKm: number, technicianId: number, milestoneId: number, isMaintenance: boolean, isRepair: boolean): void {
        const ref = this.modal.open(ServiceDetailDialogComponent, {
            data: { title: 'Schedule Service', message: '', carModelId, numOfKm, ticketId, technicianId, milestoneId, isMaintenance, isRepair },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });
        ref.afterClosed$.subscribe(confirmed => { if (confirmed) this.initTicket(); });
    }

    onComplete(orderId: number): void {
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
            data: { message: 'Are you sure you want to mark this task as completed?', isConfirm: true },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.completeTechnicianTask(orderId).subscribe({
                    next: () => {
                        this.tickets = this.tickets.filter(ticket => ticket.id !== orderId);
                        this.modal.open(ConfirmDialogComponent, { data: { message: 'Status updated successfully!', isConfirm: false } });
                        this.initTicket();
                    },
                    error: (err: any) => this.modal.open(ConfirmDialogComponent, { data: { message: 'Error updating status.', isConfirm: false } })
                });
            }
        });
    }

    onDeliver(orderId: number): void {
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, {
            data: { message: 'Confirm vehicle handover to customer? This will mark the order as DONE.', isConfirm: true },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
        });
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.confirmDelivery(orderId).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, { data: { message: 'Vehicle handed over successfully!', isConfirm: false } });
                        this.initTicket();
                    },
                    error: (err: any) => {
                        console.error('Handover error:', err);
                        this.modal.open(ConfirmDialogComponent, { data: { message: 'Error during handover.', isConfirm: false } });
                    }
                });
            }
        });
    }

    onCancel(orderId: number): void {
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, { data: { message: 'Are you sure to cancel?', isConfirm: true } });
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.cancelOrder(orderId).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, { data: { message: 'Cancelled successfully.', isConfirm: false } });
                        setTimeout(() => this.initTicket(), 250);
                    },
                    error: (err: any) => console.error('Cancel error:', err)
                });
            }
        });
    }

    onReopen(orderId: number): void {
        const confirmDialogRef = this.modal.open(ConfirmDialogComponent, { data: { message: 'Are you sure to reactivate?', isConfirm: true } });
        confirmDialogRef.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.reopenOrder(orderId).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, { data: { message: 'Reactivated successfully.', isConfirm: false } });
                        setTimeout(() => this.initTicket(), 250);
                    },
                    error: (err: any) => console.error('Reopen error:', err)
                });
            }
        });
    }

    trackByKey(index: number, item: any): string { return item.key; }

    // --- REPORT COST ---
    onReportIssue(ticketId: number): void {
        const ref = this.modal.open(ReportCostDialogComponent, {
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop'
        });

        ref.afterClosed$.subscribe(result => {
            if (result) {
                const req = { ticketId, amount: result.amount, reason: result.reason };
                this.maintenanceService.requestAdditionalCost(req).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, {
                            data: { message: 'Request sent to Staff successfully!', isConfirm: false }
                        });
                        this.initTicket();
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.modal.open(ConfirmDialogComponent, {
                            data: { message: 'Failed to send request.', isConfirm: false }
                        });
                    }
                });
            }
        });
    }

    onProcessApproval(ticketId: number, decision: 'APPROVE' | 'REJECT'): void {
        const msg = decision === 'APPROVE'
            ? 'Customer approved the additional cost? Technician will resume work.'
            : 'Customer rejected the cost? This order will be CANCELLED.';

        const ref = this.modal.open(ConfirmDialogComponent, { data: { message: msg, isConfirm: true } });

        ref.afterClosed$.subscribe(confirmed => {
            if (confirmed) {
                this.maintenanceService.processDecision(ticketId, decision).subscribe({
                    next: () => {
                        this.modal.open(ConfirmDialogComponent, {
                            data: { message: 'Order updated successfully!', isConfirm: false }
                        });
                        this.initTicket();
                    },
                    error: (err: any) => {
                        console.error(err);
                        this.modal.open(ConfirmDialogComponent, {
                            data: { message: 'Error processing request.', isConfirm: false }
                        });
                    }
                });
            }
        });
    }
}