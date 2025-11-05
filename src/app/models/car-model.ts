export class CarModel {
    carName: string = '';
    carType: string = '';

    constructor(init?: Partial<CarModel>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): CarModel {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { carName, carType } = (obj as any) ?? {};
        return new CarModel({
            carName: typeof carName === 'string' ? carName : '',
            carType: typeof carType === 'string' ? carType : '',
        });
    }
}