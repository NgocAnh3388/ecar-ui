import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({providedIn: 'root'})
export class CarModelService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    getAll(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/car-model/all`);
    }
}