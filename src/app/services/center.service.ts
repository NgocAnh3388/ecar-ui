import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Center } from '../models/center';

@Injectable({
    providedIn: 'root'
})
export class CenterService {
    // Đường dẫn API Spring Boot
    private apiUrl = 'http://localhost:8080/api/center';

    constructor(private http: HttpClient) { }

    // 1. Lấy danh sách (GET)
    getAll(): Observable<Center[]> {
        return this.http.get<Center[]>(this.apiUrl);
    }

    // 2. Lấy chi tiết theo ID (GET)
    getById(id: number): Observable<Center> {
        return this.http.get<Center>(`${this.apiUrl}/${id}`);
    }

    // 3. Thêm mới (POST)
    create(center: Center): Observable<Center> {
        return this.http.post<Center>(this.apiUrl, center);
    }

    // 4. Cập nhật (PUT)
    update(id: number, center: Center): Observable<Center> {
        return this.http.put<Center>(`${this.apiUrl}/${id}`, center);
    }

    // 5. Xóa (DELETE)
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}