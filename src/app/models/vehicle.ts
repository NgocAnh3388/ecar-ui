import { CarModel } from './car-model';

export class Vehicle {
    id: number = 0;
    licensePlate: string = '';

    // Khởi tạo CarModel đúng chuẩn Interface
    carModel: CarModel = {
        id: 0,
        carName: '',
        carType: '',
        active: false
    };

    vinNumber: string = '';

    // Các trường ngày tháng và km
    nextDate: Date | null = null;
    nextKm: number = 0;
    oldDate: Date | null = null;
    oldKm: number = 0;

    ownerId?: number; // ID chủ xe (optional)

    // Constructor đơn giản hóa
    constructor(init?: Partial<Vehicle>) {
        if (init) {
            Object.assign(this, init);
        }
    }
}