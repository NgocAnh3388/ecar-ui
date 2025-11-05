export class ServiceItem {
    id: number = 0;
    serviceName: string = '';
    isChecked: boolean = false;

    constructor(init?: Partial<ServiceItem>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): ServiceItem {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, serviceName, isChecked } = (obj as any) ?? {};
        return new ServiceItem({
            id: id,
            serviceName: serviceName,
            isChecked: isChecked,
        });
    }
}