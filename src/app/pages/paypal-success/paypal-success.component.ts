import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { SubscriptionService } from "../../services/subscription.service";
import { PaymentExecuteRequest } from "../../models/payment-execute-request";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-paypal-success',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './paypal-success.component.html',
    styleUrl: './paypal-success.component.css'
})
export class PaypalSuccessComponent implements OnInit, AfterViewInit {

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private subscriptionService: SubscriptionService,
    ) {}

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const paymentId = qp.get('paymentId');
        const payerId = qp.get('PayerID');

        // Check for missing parameters
        if (!paymentId || !payerId) {
            this.showError('Missing payment parameters');
            setTimeout(() => {
                this.router.navigate(['/'], { queryParams: { error: 'missing_params' } });
            }, 3000);
            return;
        }

        // Execute payment
        const request: PaymentExecuteRequest = new PaymentExecuteRequest(paymentId, payerId);

        this.subscriptionService.execute(request).subscribe({
            next: (response) => {
                console.log('Payment successful:', response);
                this.showSuccess();
                // Redirect after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/customer-payment-dashboard']);
                }, 2000);
            },
            error: (error) => {
                console.error('Payment execution failed:', error);
                this.showError('Payment processing failed');
                // Redirect back after 3 seconds
                setTimeout(() => {
                    this.router.navigate(['/'], { queryParams: { error: 'payment_failed' } });
                }, 3000);
            }
        });
    }

    ngAfterViewInit(): void {
        // Elements are ready after view init
    }

    private showSuccess(): void {
        const spinner = document.getElementById('spinner');
        const checkIcon = document.getElementById('checkIcon');
        const title = document.getElementById('title');
        const message = document.getElementById('message');
        const status = document.getElementById('status');
        const progressDots = document.getElementById('progressDots');

        if (spinner) spinner.style.display = 'none';
        if (checkIcon) checkIcon.classList.add('show');
        if (title) title.textContent = 'Payment Successful!';
        if (message) {
            message.textContent = 'Your payment has been processed successfully. Redirecting you to your dashboard...';
        }
        if (status) status.textContent = 'Thank you for your payment!';
        if (progressDots) progressDots.style.display = 'none';
    }

    private showError(errorMessage: string): void {
        const spinner = document.getElementById('spinner');
        const errorIcon = document.getElementById('errorIcon');
        const title = document.getElementById('title');
        const message = document.getElementById('message');
        const status = document.getElementById('status');
        const progressDots = document.getElementById('progressDots');

        if (spinner) spinner.style.display = 'none';
        if (errorIcon) errorIcon.classList.add('show');
        if (title) title.textContent = 'Payment Failed';
        if (message) {
            message.textContent = 'We encountered an issue processing your payment. Please try again or contact support.';
        }
        if (status) status.textContent = errorMessage || 'Redirecting back...';
        if (progressDots) progressDots.style.display = 'none';
    }
}