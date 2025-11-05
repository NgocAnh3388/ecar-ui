import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {MaintenanceHistorySearch} from "../models/maintenance-history-search";
import {ScheduleRequest} from "../models/schedule-request";
import {ServiceCreateRequest} from "../models/service-create-request";

@Injectable({providedIn: 'root'})
export class MaintenanceService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    getMaintenanceHistory(searchValue: string, pageSize: number, pageIndex: number): Observable<any> {
        const searchRequest = new MaintenanceHistorySearch(searchValue, pageIndex, pageSize);
        return this.http.post<any>(`${this.api}/api/maintenance/history`, searchRequest);
    }

    createSchedule(request: ScheduleRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/maintenance/create`, request);
    }

    getAll(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/maintenance/all`);
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
}