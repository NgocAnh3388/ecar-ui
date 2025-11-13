import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BadgeComponent } from "../../../shared/components/ui/badge/badge.component";
import { DatePipe, CommonModule } from "@angular/common";
import { SubscriptionService } from "../../../services/subscription.service";
import { SubscriptionInfo } from "../../../models/subscription-info";
import { RenewDialogComponent } from "../../dialog/renew-dialog/renew-dialog.component";
import { ModalService } from "../../modal/modal.service";
import { PaymentHistory } from "../../../models/payment-history";
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component'; // <-- THÊM IMPORT NÀY
import { forkJoin } from 'rxjs'; // <-- THÊM IMPORT NÀY
import { finalize } from 'rxjs/operators'; // <-- THÊM IMPORT NÀY

@Component({
    selector: 'app-customer-payment-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        BadgeComponent,
        LoadingSpinnerComponent // Cần để hiển thị spinner
    ],
    templateUrl: './customer-payment-dashboard.component.html',
    styleUrl: './customer-payment-dashboard.component.css'
})
export class CustomerPaymentDashboardComponent implements OnInit, AfterViewInit {

    paymentHistory: PaymentHistory[] = [];
    subscription: SubscriptionInfo | undefined;
    isLoading = false;

    constructor(
        private subscriptionService: SubscriptionService,
        private modal: ModalService,
    ) {}

    ngOnInit(): void {
        this.loadInitialData(); // Gọi một hàm duy nhất để tải dữ liệu
    }

    loadInitialData() {
        this.isLoading = true; // 1. Bật spinner

        forkJoin({
            subscription: this.subscriptionService.get(),
            history: this.subscriptionService.getHistory()
        })
            .pipe(
                // 2. Tắt spinner sau khi CẢ HAI API hoàn thành
                finalize(() => this.isLoading = false)
            )
            .subscribe({
                next: (results) => {
                    // 3. Gán dữ liệu khi cả hai đều thành công
                    this.subscription = results.subscription || undefined;
                    this.paymentHistory = results.history || [];
                    console.log('All initial data loaded successfully');
                },
                error: (err) => {
                    // 4. Xử lý lỗi nếu một trong hai API thất bại
                    console.error('Failed to load initial data:', err);
                    this.subscription = undefined;
                    this.paymentHistory = [];
                }
            });
    }


    ngAfterViewInit(): void {}

    /** ✅ Badge color theo trạng thái */
    getSubscriptionStatusBadgeColor(endDate?: Date | string | null): 'success' | 'warning' | 'error' | 'light' {
        const status = this.getSubscriptionStatus(endDate);
        switch (status) {
            case 'Còn hiệu lực': return 'success';
            case 'Sắp kết thúc': return 'warning';
            case 'Hết hạn': return 'error';
            default: return 'light';
        }
    }

    /** ✅ Badge status payment */
    getPaymentStatusBadge(status: string): 'success' | 'warning' | 'error' {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'INIT': return 'warning';
            case 'FAILED': return 'error';
            default: return 'error';
        }
    }

    /** ✅ Logic xác định trạng thái gói */
    getSubscriptionStatus(endDate?: Date | string | null): "Chưa đăng ký" | "Hết hạn" | "Sắp kết thúc" | "Còn hiệu lực" {
        if (!endDate) return 'Chưa đăng ký';

        const enDate = endDate instanceof Date ? endDate : new Date(endDate);
        if (isNaN(enDate.getTime())) return 'Chưa đăng ký';

        const now = new Date();
        const endOfDay = new Date(enDate);
        endOfDay.setHours(23, 59, 59, 999);

        const diffMs = endOfDay.getTime() - now.getTime();
        if (diffMs < 0) return 'Hết hạn';

        const MS_PER_DAY = 24 * 60 * 60 * 1000;
        const daysLeft = Math.ceil(diffMs / MS_PER_DAY);

        if (daysLeft <= 30) return 'Sắp kết thúc';
        return 'Còn hiệu lực';
    }

    /** ✅ Nút hiển thị theo trạng thái */
    getRenewButtonLabel(endDate?: Date | string | null): string {
        const status = this.getSubscriptionStatus(endDate);
        switch (status) {
            case 'Còn hiệu lực': return 'Gia hạn';
            case 'Sắp kết thúc': return 'Gia hạn ngay';
            case 'Hết hạn': return 'Đăng ký lại';
            default: return 'Đăng ký gói dịch vụ';
        }
    }

    /** ✅ Lấy dữ liệu gói */
    initSubscription() {
        this.isLoading = true;
        this.subscriptionService.get().subscribe({
            next: (res) => {
                this.subscription = res || undefined;
                this.isLoading = false;
            },
            error: () => {
                this.subscription = undefined;
                this.isLoading = false;
            }
        });
    }

    /** ✅ Mở modal gia hạn / đăng ký */
    renew() {
        const ref = this.modal.open(RenewDialogComponent, {
            data: { title: 'Renew / Register Service Package', message: '' },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe(confirmed => {
            // Logic này không đúng, vì dialog 'renew' không trả về 'confirmed'.
            // Nó sẽ chuyển trang. Hàm này chỉ hữu ích nếu dialog có nút OK/Cancel.
            // Tuy nhiên, để sửa lỗi biên dịch, chúng ta cứ giữ nó.
            // Nếu sau khi thanh toán bạn quay về trang này, ngOnInit sẽ chạy lại loadInitialData.
            if (confirmed) {
                this.loadInitialData();
            }
        });
    }

    /** ✅ Lịch sử thanh toán */
    initPaymentHistory() {
        this.subscriptionService.getHistory().subscribe({
            next: (res) => this.paymentHistory = res,
            error: () => this.paymentHistory = []
        });
    }
}
