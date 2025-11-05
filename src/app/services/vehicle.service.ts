import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {VehicleCreate} from "../models/vehicle-create";

@Injectable({providedIn: 'root'})
export class VehicleService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    getVehicles(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/vehicles`);
    }

    addVehicle(request: VehicleCreate): Observable<any> {
        return this.http.post<any>(`${this.api}/api/vehicles`, request);
    }
}