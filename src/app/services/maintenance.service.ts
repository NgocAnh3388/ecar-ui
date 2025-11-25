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

    // Hàm lấy lịch sử (cho trang Customer Maintenance)
    getMaintenanceHistory(searchValue: string, pageSize: number, pageIndex: number): Observable<any> {
        const searchRequest = new MaintenanceHistorySearch(searchValue, pageIndex, pageSize);
        return this.http.post<any>(`${this.api}/api/maintenance/history`, searchRequest);
    }

    // Hàm kiểm tra xe bận (cho trang Booking)
    getHistory(searchRequest: any): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/history`, searchRequest);
    }

    // Hàm tạo lịch hẹn
    createSchedule(request: MaintenanceScheduleRequest | ScheduleRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/create`, request);
    }

    // ================= ADMIN / TECHNICIAN METHODS =================

    // Lấy tất cả phiếu (Admin/Staff)
    getAll(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/all`);
    }

    // Lấy danh sách task của Technician
    getMyTasks(): Observable<MaintenanceTicket[]> {
        return this.http.get<MaintenanceTicket[]>(`${this.api}/api/maintenance/technician/my-tasks`);
    }

    // Lấy Milestone (mốc bảo dưỡng)
    getMilestone(id: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/milestone/${id}`);
    }

    // Lấy Service Group theo model và milestone (để chọn dịch vụ khi tạo phiếu)
    getMaintenanceServiceGroup(carModelId: number, milestoneId: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/service-group/${carModelId}/${milestoneId}`);
    }

    // Lấy Service Group của một phiếu đã tạo (để xem chi tiết)
    getServiceGroup(ticketId: number): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/service-group/${ticketId}`);
    }

    // Staff tạo phiếu dịch vụ (Assign Task)
    createService(request: ServiceCreateRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/service-create`, request);
    }

    // Technician hoàn thành công việc
    completeTechnicianTask(id: number): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/${id}/technician-complete`, {});
    }

    // Hủy phiếu
    cancelOrder(id: number): Observable<any> {
        return this.http.put<any>(`${this.api}/api/maintenance/${id}/cancel`, {});
    }

    // Mở lại phiếu đã hủy
    reopenOrder(id: number): Observable<any> {
        return this.http.put<any>(`${this.api}/api/maintenance/${id}/reopen`, {});
    }

    // --- MỚI: Staff xác nhận giao xe cho khách (Handover) ---
    confirmDelivery(orderId: number): Observable<any> {
        // Backend endpoint: PUT /api/maintenance/{id}/handover
        // Lưu ý: Đảm bảo backend có endpoint này
        return this.http.put(`${this.api}/api/maintenance/${orderId}/handover`, {});
    }
}