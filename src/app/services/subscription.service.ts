import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RenewRequest} from "../models/renew-request";
import {PaymentExecuteRequest} from "../models/payment-execute-request";

@Injectable({providedIn: 'root'})
export class SubscriptionService {
    private api = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    get(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/subscription`);
    }

    renew(request: RenewRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/subscription/renew`, request);
    }

    execute(request: PaymentExecuteRequest): Observable<any> {
        return this.http.post<any>(`${this.api}/api/subscription/execute`, request);
    }

    getHistory(): Observable<any> {
        return this.http.get<any>(`${this.api}/api/subscription/payment-history`);
    }
}