export class Center {
    id: number = 0;
    centerName: string = '';
    address?: string = ''; // <--- Đã thêm trường này (dấu ? để tránh lỗi null)

    constructor(init?: Partial<Center>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): Center {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }

        // Ép kiểu an toàn và lấy thêm address
        const { id, centerName, address } = (obj as any) ?? {};

        return new Center({
            id: id,
            centerName: centerName,
            address: address // Map thêm address vào đây
        });
    }
}