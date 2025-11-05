import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({providedIn: 'root'})
export class CenterService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    getCenter(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/center`);
    }

}