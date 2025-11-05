import {AfterViewInit, Component, OnInit} from '@angular/core';
import {BadgeComponent} from "../../../shared/components/ui/badge/badge.component";
import {DatePipe} from "@angular/common";
import {SubscriptionService} from "../../../services/subscription.service";
import {SubscriptionInfo} from "../../../models/subscription-info";
import {RenewDialogComponent} from "../../dialog/renew-dialog/renew-dialog.component";
import {ModalService} from "../../modal/modal.service";
import {PaymentHistory} from "../../../models/payment-history";

@Component({
  selector: 'app-customer-payment-dashboard',
    imports: [
        BadgeComponent,
        DatePipe
    ],
  templateUrl: './customer-payment-dashboard.component.html',
  styleUrl: './customer-payment-dashboard.component.css'
})
export class CustomerPaymentDashboardComponent implements OnInit, AfterViewInit {

    paymentHistory: PaymentHistory[] = [];
    subscription: SubscriptionInfo | undefined;

    constructor(private subscriptionService: SubscriptionService,
                private modal: ModalService,) {

    }

    ngOnInit(): void {
        this.initSubscription();
        this.initPaymentHistory();
    }

    ngAfterViewInit(): void {

    }

    getSubscriptionStatusBadgeColor(endDate?: Date | string | null): 'success' | 'warning' | 'error' | 'light' {
        const status = this.getSubscriptionStatus(endDate);
        switch (status) {
            case 'Còn hiệu lực':
                return 'success';
            case 'Sắp kết thúc':
                return 'warning';
            case 'Hết hạn':
                return 'error';
            case 'Chưa đăng ký':
                return 'light';
            default:
                return 'error';
        }
    }

    getPaymentStatusBadge(status: string): 'success' | 'warning' | 'error' {
        switch (status) {
            case 'APPROVED':
                return 'success';
            case 'INIT':
                return 'warning';
            case 'FAILED':
                return 'error';
            default:
                return 'error';
        }
    }


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

        if (daysLeft <= 15) return 'Sắp kết thúc';
        return 'Còn hiệu lực';
    }

    initSubscription() {
        this.subscriptionService.get().pipe().subscribe(res => {
            if (res) {
                this.subscription = res;
            }
        });
    }

    renew() {
        const ref = this.modal.open(RenewDialogComponent, {
            data: { title: 'Đặt lịch', message: '' },
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

    initPaymentHistory() {
        this.subscriptionService.getHistory().pipe().subscribe(res => {
           this.paymentHistory = res;
        });
    }
}
