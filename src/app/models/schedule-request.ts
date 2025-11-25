// 1. Class (Dùng nếu bạn muốn tạo đối tượng bằng new)
export class ScheduleRequest {
    centerId: number;
    scheduleTime: string;
    scheduleDate: string;
    vehicleId: number;
    numOfKm: number;
    isMaintenance: boolean;
    isRepair: boolean;
    remark: string;

    constructor(centerId: number,
                scheduleTime: string,
                scheduleDate: string,
                vehicleId: number,
                numOfKm: number,
                isMaintenance: boolean,
                isRepair: boolean,
                remark: string) {
        this.centerId = centerId;
        this.scheduleTime = scheduleTime;
        this.scheduleDate = scheduleDate;
        this.vehicleId = vehicleId;
        this.numOfKm = numOfKm;
        this.isMaintenance = isMaintenance;
        this.isRepair = isRepair;
        this.remark = remark;
    }
}

// 2. Interface (Dùng cho việc định kiểu dữ liệu, DTO)
// <-- Đặt nó RA NGOÀI class
export interface MaintenanceScheduleRequest {
    centerId: number;
    scheduleTime: string;
    scheduleDate: string;
    vehicleId: number;
    numOfKm: number;
    isMaintenance: boolean;
    isRepair: boolean;
    remark: string;
}