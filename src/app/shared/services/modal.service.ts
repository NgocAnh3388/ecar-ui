import { Injectable } from '@angular/core';
import { Dialog, DialogConfig, DialogRef } from '@angular/cdk/dialog';

@Injectable({
    providedIn: 'root'
})
export class ModalService {
    constructor(private dialog: Dialog) {}

    open<T, D = any, R = any>(component: any, config?: DialogConfig<D, DialogRef<R, T>>) {
        return this.dialog.open(component, {
            minWidth: '300px',
            maxWidth: '90vw',
            panelClass: ['modal-panel', 'bg-white', 'rounded-lg', 'shadow-xl', 'outline-none'],
            backdropClass: 'modal-backdrop',
            ...config
        });
    }

    // Hàm chuẩn
    closeAll() {
        this.dialog.closeAll();
    }

    // --- THÊM HÀM NÀY ĐỂ FIX LỖI ---
    // Hàm này giúp tương thích ngược với code cũ
    closeModal() {
        this.closeAll();
    }
}