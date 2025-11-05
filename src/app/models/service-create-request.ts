export class ServiceCreateRequest {
    ticketId: number;
    numOfKm: number;
    scheduleId: number;
    technicianId: number;
    checkedServiceIds: number[];

    constructor(ticketId: number, numOfKm: number, scheduleId: number, technicianId: number, checkedServiceIds: number[]) {
        this.ticketId = ticketId;
        this.numOfKm = numOfKm;
        this.scheduleId = scheduleId;
        this.technicianId = technicianId;
        this.checkedServiceIds = checkedServiceIds;
    }
}