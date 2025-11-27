import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SparePart } from '../models/spare-part.model';
import { CarModel } from '../models/car-model';

@Injectable({
    providedIn: 'root'
})
export class InventoryService {
    // API endpoint chính xác
    private baseUrl = 'http://localhost:8080/api/inventory';
    private carModelUrl = 'http://localhost:8080/api/car-model';
    private centerUrl = 'http://localhost:8080/api/center';

    constructor(private http: HttpClient) {}

    // ======================= PHỤ TÙNG (Spare Parts) =======================

    // Lấy tất cả phụ tùng
    getAllParts(): Observable<SparePart[]> {
        return this.http.get<SparePart[]>(`${this.baseUrl}/parts`);
    }

    // Lấy danh sách dòng xe
    getCarModels(): Observable<CarModel[]> {
        return this.http.get<CarModel[]>(`${this.carModelUrl}/all`);
    }

    // Tạo mới phụ tùng
    createPart(part: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/parts`, part);
    }

    // Cập nhật phụ tùng
    updatePart(id: number, body: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/parts/${id}`, body);
    }

    // Xóa phụ tùng
    deletePart(id: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/parts/${id}`);
    }

    // ======================= TỒN KHO (Inventory) =======================

    // Lấy danh sách center (trung tâm)
    getCenters(): Observable<any[]> {
        return this.http.get<any[]>(this.centerUrl);
    }

    // Lấy tồn kho theo center
    getInventoryByCenter(centerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/by-center/${centerId}`);
    }

    // Lấy danh sách phụ tùng sắp hết hàng ở center
    getLowStockByCenter(centerId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/low-stock/by-center/${centerId}`);
    }

    // Cập nhật tồn kho (Restock / Adjust)
    updateStock(inventoryId: number, payload: { isAddition: boolean; quantityChange: number }): Observable<any> {
        return this.http.patch(`${this.baseUrl}/${inventoryId}/stock`, payload);
    }

    // Lấy thông tin tồn kho của 1 phụ tùng trên tất cả center
    getStockAcrossCenters(partId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/inventory/stock-across/${partId}`);
    }

    // Lấy lịch sử sử dụng phụ tùng
    getUsedPartsHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}/used-history`);
    }

}
