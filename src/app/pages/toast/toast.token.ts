import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';
import {ToastConfig} from "./toast.type";

export const TOAST_DATA = new InjectionToken<ToastConfig>('TOAST_DATA');

export class ToastRef {
    private readonly _closed = new Subject<void>();
    closed$ = this._closed.asObservable();
    constructor(private _dispose: () => void) {}
    close() { this._closed.next(); this._closed.complete(); this._dispose(); }
}
