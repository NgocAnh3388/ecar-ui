import { AfterViewInit, Component, OnInit } from '@angular/core';
import { BadgeComponent } from "../../../shared/components/ui/badge/badge.component";
import { DatePipe, NgIf, NgForOf } from "@angular/common";
import { SubscriptionService } from "../../../services/subscription.service";
import { SubscriptionInfo } from "../../../models/subscription-info";
import { RenewDialogComponent } from "../../dialog/renew-dialog/renew-dialog.component";
import { ModalService } from "../../modal/modal.service";
import { PaymentHistory } from "../../../models/payment-history";

@Component({
  selector: 'app-customer-payment-dashboard',
  standalone: true,
  imports: [BadgeComponent, DatePipe, NgIf, NgForOf],
  templateUrl: './customer-payment-dashboard.component.html',
  styleUrl: './customer-payment-dashboard.component.css'
})
export class CustomerPaymentDashboardComponent implements OnInit, AfterViewInit {

  paymentHistory: PaymentHistory[] = [];
  subscription: SubscriptionInfo | undefined;
  isLoading = true;

  constructor(
    private subscriptionService: SubscriptionService,
    private modal: ModalService,
  ) {}

  ngOnInit(): void {
    this.initSubscription();
    this.initPaymentHistory();
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
      data: { title: 'Gia hạn / Đăng ký gói dịch vụ', message: '' },
      panelClass: ['modal-panel', 'p-0'],
      backdropClass: 'modal-backdrop',
      disableClose: false,
    });

    ref.afterClosed$.subscribe(confirmed => {
      if (confirmed) {
        this.initSubscription();
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
