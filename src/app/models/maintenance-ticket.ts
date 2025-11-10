export class MaintenanceTicket {
    id: number = 0;
    customerName: string = '';
    carModelId: number = 0;
    carName: string = '';
    licensePlate: string = '';
    numOfKm: number = 0;
    submittedAt: Date | null = null;
    staffName: string = '';
    staffId: number = 0;
    staffReceivedAt: Date | null = null;
    technicianName: string = '';
    technicianId: number = 0;
    technicianReceivedAt: Date | null = null;
    completedAt: Date | null = null;
    status: string = '';
    isMaintenance: boolean = false;
    isRepair: boolean = false;
    centerName: string = '';
    scheduleDate: string = '';
    scheduleTime: string = '';
    scheduleId: number = 0;

    constructor(init?: Partial<MaintenanceTicket>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): MaintenanceTicket {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { id, customerName, carModelId, carName, licensePlate, numOfKm, submittedAt, staffName, staffId, staffReceivedAt,
            technicianName, technicianId, technicianReceivedAt, completedAt, status, isMaintenance, isRepair,
            centerName, scheduleDate, scheduleTime, scheduleId } = (obj as any) ?? {};
        return new MaintenanceTicket({
            id: id,
            customerName: customerName,
            carModelId: carModelId,
            carName: carName,
            licensePlate: licensePlate,
            numOfKm: numOfKm,
            submittedAt: submittedAt,
            staffName: staffName,
            staffId: staffId,
            staffReceivedAt: staffReceivedAt,
            technicianName: technicianName,
            technicianId: technicianId,
            technicianReceivedAt: technicianReceivedAt,
            completedAt: completedAt,
            status: status,
            isMaintenance: isMaintenance,
            isRepair: isRepair,
            centerName: centerName,
            scheduleDate: scheduleDate,
            scheduleTime: scheduleTime,
            scheduleId: scheduleId,
        });
    }

}

