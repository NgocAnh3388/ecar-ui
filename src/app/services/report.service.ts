import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
// Import Model: Dùng ../ để lùi ra khỏi thư mục services và vào thư mục models
import { ProfitReportResponse } from '../models/report.model';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    // Đường dẫn gốc tới Controller Report trong Backend
    // Bạn có thể đổi thành environment.apiUrl nếu đã cấu hình environment
    private apiUrl = 'http://localhost:8080/api/reports';

    constructor(private http: HttpClient) { }

    /**
     * Gọi API lấy báo cáo lợi nhuận
     * @param startDate Chuỗi ngày bắt đầu (YYYY-MM-DD) lấy từ input type="date"
     * @param endDate Chuỗi ngày kết thúc (YYYY-MM-DD) lấy từ input type="date"
     */
    getProfitReport(startDate: string, endDate: string): Observable<ProfitReportResponse> {

        // XỬ LÝ QUAN TRỌNG:
        // Input HTML chỉ trả về ngày (ví dụ: 2023-11-20)
        // Backend Java (LocalDateTime) cần cả giờ phút giây.
        // -> Ta tự động gán 00:00:00 cho ngày bắt đầu và 23:59:59 cho ngày kết thúc.
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);


        // Gọi phương thức GET
        return this.http.get<ProfitReportResponse>(`${this.apiUrl}/profit`, { params });
    }
}