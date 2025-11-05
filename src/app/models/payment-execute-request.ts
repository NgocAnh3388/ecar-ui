export class PaymentExecuteRequest {
    paymentId: string;
    payerId: string;

    constructor(paymentId: string, payerId: string) {
        this.paymentId = paymentId;
        this.payerId = payerId;
    }
}