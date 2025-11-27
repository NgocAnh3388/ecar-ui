import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CarModel } from '../models/car-model';

@Injectable({ providedIn: 'root' })
export class CarModelService {
    // URL API Backend
    private apiUrl = 'http://localhost:8080/api/car-model';

    constructor(private http: HttpClient) { }

    // 1. Lấy danh sách tất cả mẫu xe
    getAll(): Observable<CarModel[]> {
        return this.http.get<CarModel[]>(this.apiUrl);
    }

    // 2. Lấy chi tiết 1 mẫu xe
    getById(id: number): Observable<CarModel> {
        return this.http.get<CarModel>(`${this.apiUrl}/${id}`);
    }

    // 3. Thêm mới mẫu xe
    create(model: CarModel): Observable<CarModel> {
        return this.http.post<CarModel>(this.apiUrl, model);
    }

    // 4. Cập nhật mẫu xe
    update(id: number, model: CarModel): Observable<CarModel> {
        return this.http.put<CarModel>(`${this.apiUrl}/${id}`, model);
    }

    // 5. Xóa mẫu xe (ẩn đi bằng active=false hoặc xóa cứng)
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}