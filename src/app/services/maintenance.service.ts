import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

// Import Models
import { MaintenanceHistorySearch } from "../models/maintenance-history-search";
import { ScheduleRequest, MaintenanceScheduleRequest } from "../models/schedule-request";
import { ServiceCreateRequest } from "../models/service-create-request";
import { MaintenanceTicket } from "../models/maintenance-ticket";

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {}

    // ================= CUSTOMER METHODS =================

    // Hàm lấy lịch sử
    getMaintenanceHistory(searchValue: string, pageSize: number, pageIndex: number): Observable<any> {
        const searchRequest = new MaintenanceHistorySearch(searchValue, pageIndex, pageSize);
        return this.http.post<any>(`${this.api}/api/maintenance/history`, searchRequest);
    }

    // Hàm tạo lịch hẹn
    createSchedule(request: MaintenanceScheduleRequest | ScheduleRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/create`, request);
    }

    // Hàm hủy đơn (Đã sửa URL trỏ về BookingController như backend bạn cung cấp)
    cancelTicket(ticketId: number): Observable<any> {
        // Gọi đúng vào controller Maintenance
        return this.http.put(`${this.api}/api/maintenance/${ticketId}/cancel`, {}, {
            withCredentials: true
        });
    }

    // ================= OTHER METHODS (Giữ nguyên) =================
    getHistory(searchRequest: any): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/history`, searchRequest);
    }
    getAll(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/all`);
    }
    getMyTasks(): Observable<MaintenanceTicket[]> {
        return this.http.get<MaintenanceTicket[]>(`${this.api}/api/maintenance/technician/my-tasks`);
    }
    getMilestone(id: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/milestone/${id}`);
    }
    getMaintenanceServiceGroup(carModelId: number, milestoneId: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/service-group/${carModelId}/${milestoneId}`);
    }
    getServiceGroup(ticketId: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/service-group/${ticketId}`);
    }
    createService(request: ServiceCreateRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/service-create`, request);
    }
    completeTechnicianTask(id: number): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/${id}/technician-complete`, {});
    }
    cancelOrder(id: number): Observable<any> {
        return this.http.put<any>(`${this.api}/api/maintenance/${id}/cancel`, {});
    }
    reopenOrder(id: number): Observable<any> {
        return this.http.put<any>(`${this.api}/api/maintenance/${id}/reopen`, {});
    }
    confirmDelivery(orderId: number): Observable<any> {
        return this.http.put(`${this.api}/api/maintenance/${orderId}/handover`, {});
    }
    requestAdditionalCost(request: { ticketId: number; amount: number; reason: string }): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/add-cost`, request);
    }
    processDecision(id: number, decision: 'APPROVE' | 'REJECT'): Observable<any> {
        return this.http.put<any>(`${this.api}/api/maintenance/${id}/approval?decision=${decision}`, {});
    }
}