export class MaintenanceHistory {
    // ID chính (Maintenance History ID)
    id: number = 0;

    // Các ID liên quan (nếu có)
    maintenanceId?: number;
    bookingId?: number;

    // Thông tin xe
    carName: string = '';
    carModelName: string = '';
    carModel?: { carName: string } = { carName: '' };
    carType: string = '';
    licensePlate: string = '';

    // Thời gian
    scheduleDate: string = '';
    scheduleTime: string = '';
    submittedAt: Date | string | null = null;
    completedAt: Date | string | null = null;
    handoverDate: Date | string | null = null;

    // Trạng thái
    status: string = '';
    subInfo?: string = '';

    constructor(init?: Partial<MaintenanceHistory>) {
        if (init) {
            Object.assign(this, init);
            // Logic fallback ID
            if (!this.id) {
                this.id = this.maintenanceId || this.bookingId || 0;
            }
        }
    }

    static fromJSON(jsonStr: string): MaintenanceHistory {
        try {
            const data = JSON.parse(jsonStr);
            return new MaintenanceHistory({
                ...data,
                id: data.id || data.maintenanceId || data.bookingId || 0,
                carModel: data.carModel ? { carName: data.carModel.carName } : undefined
            });
        } catch {
            return new MaintenanceHistory();
        }
    }
}