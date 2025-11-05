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