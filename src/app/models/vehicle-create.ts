export class VehicleCreate {
    carModelId: number;
    licensePlate: string;
    vinNumber: string;

    constructor(carModelId: number, licensePlate: string, vinNumber: string) {
        this.carModelId = carModelId;
        this.licensePlate = licensePlate;
        this.vinNumber = vinNumber;
    }
}