import {CarModel} from "./car-model";

export class Vehicle {
    id: number = 0;
    licensePlate: string = '';
    carModel: CarModel = new CarModel();
    vinNumber: string = '';
    nextDate: Date | null = null;
    nextKm: number = 0;
    oldDate: Date | null = null;
    oldKm: number = 0;

    constructor(init?: Partial<Vehicle>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): Vehicle {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, licensePlate, carModel, vinNumber, nextDate, nextKm, oldDate, oldKm } = (obj as any) ?? {};
        return new Vehicle({
            id: id,
            licensePlate: typeof licensePlate === 'string' ? licensePlate : '',
            carModel: carModel,
            vinNumber: typeof vinNumber === 'string' ? vinNumber : '',
            nextDate: nextDate,
            nextKm: typeof nextKm === 'number' ? nextKm : 0,
            oldDate: oldDate,
            oldKm: typeof oldKm === 'number' ? oldKm : 0,
        });
    }

}