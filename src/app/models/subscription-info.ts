export class SubscriptionInfo {
    id: number = 0;
    startDate: Date | null = null;
    endDate: Date | null = null;
    paymentDate: Date | null = null;

    constructor(init?: Partial<SubscriptionInfo>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): SubscriptionInfo {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, startDate, endDate, paymentDate } = (obj as any) ?? {};
        return new SubscriptionInfo({
            id: id,
            startDate: startDate,
            endDate: endDate,
            paymentDate: paymentDate,
        });
    }
}