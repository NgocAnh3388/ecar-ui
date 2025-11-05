import { Component } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {SubscriptionService} from "../../services/subscription.service";
import {PaymentExecuteRequest} from "../../models/payment-execute-request";

@Component({
  selector: 'app-paypal-success',
  imports: [],
  templateUrl: './paypal-success.component.html',
  styleUrl: './paypal-success.component.css'
})
export class PaypalSuccessComponent {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private subscriptionService: SubscriptionService,
    ) {}

    ngOnInit(): void {
        const qp = this.route.snapshot.queryParamMap;
        const paymentId = qp.get('paymentId');
        const payerId   = qp.get('PayerID');

        if (!paymentId || !payerId) {
            this.router.navigate(['/'], { queryParams: { error: 'missing_params' } }).then();
            return;
        }

        const request: PaymentExecuteRequest = new PaymentExecuteRequest(paymentId, payerId);
        this.subscriptionService.execute(request).pipe()
            .subscribe(rs => {
                    this.router.navigate(['/customer-payment-dashboard']).then();
                }
            )
    }
}
