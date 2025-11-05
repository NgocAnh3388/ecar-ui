export class PaymentHistory {
    paymentDate: Date | null = null;
    paymentMethod: string = '';
    paymentStatus: string = '';
    numOfYears: number = 0;

    constructor(init?: Partial<PaymentHistory>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): PaymentHistory {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { paymentDate, paymentMethod, paymentStatus, numOfYears, } = (obj as any) ?? {};
        return new PaymentHistory({
            paymentDate: paymentDate,
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            numOfYears: numOfYears,
        });
    }

}