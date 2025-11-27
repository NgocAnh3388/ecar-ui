import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    // Đảm bảo URL này khớp với backend của bạn (8080)
    private api = 'http://localhost:8080/api/notifications';

    constructor(private http: HttpClient) { }

    // Lấy danh sách thông báo của user hiện tại
    getMyNotifications(): Observable<any[]> {
        return this.http.get<any[]>(this.api, { withCredentials: true });
    }

    // Đánh dấu một thông báo là đã đọc
    markAsRead(id: number): Observable<void> {
        return this.http.put<void>(`${this.api}/${id}/read`, {}, { withCredentials: true });
    }

    // Đánh dấu tất cả thông báo là đã đọc
    markAllAsRead(): Observable<void> {
        return this.http.put<void>(`${this.api}/read-all`, {}, { withCredentials: true });
    }
}