export class Center {
    id: number = 0;
    centerName: string = '';

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
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, centerName } = (obj as any) ?? {};
        return new Center({
            id: id,
            centerName: centerName,
        });
    }
}