import {ServiceItem} from "./service-item";

export class ServiceGroup {
    category: string = '';
    items: ServiceItem[] = [];

    constructor(init?: Partial<ServiceGroup>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): ServiceGroup {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { category, items } = (obj as any) ?? {};
        return new ServiceGroup({
            category: category,
            items: items,
        });
    }
}