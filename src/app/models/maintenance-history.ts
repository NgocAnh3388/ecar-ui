export class MaintenanceHistory {
    carName: string = '';
    carType: string = '';
    licensePlate: string = '';
    submittedAt: Date | null = null;
    completedAt: Date | null = null;
    status: string = '';

    constructor(init?: Partial<MaintenanceHistory>) {
        Object.assign(this, init);
    }

    static fromJSON(jsonStr: string): MaintenanceHistory {
        let obj: unknown;
        try {
            obj = JSON.parse(jsonStr);
        } catch {
            throw new Error('Invalid JSON');
        }
        // ép kiểu an toàn: chỉ nhận các field hợp lệ
        const { carName, carType, licensePlate, submittedAt, completedAt, status } = (obj as any) ?? {};
        return new MaintenanceHistory({
            carName: typeof carName === 'string' ? carName : '',
            carType: typeof carType === 'string' ? carType : '',
            licensePlate: typeof licensePlate === 'string' ? licensePlate : '',
            submittedAt: submittedAt,
            completedAt: completedAt,
            status: typeof licensePlate === 'string' ? status : '',
        });
    }

}