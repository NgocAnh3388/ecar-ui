// src/app/pages/dialog/confirm-dialog/confirm-dialog.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalRef } from '../../modal/modal-ref';
import { MODAL_DATA } from '../../modal/modal.token';

// Định nghĩa kiểu dữ liệu truyền vào để code rõ ràng hơn
interface DialogData {
    message?: string;
    isConfirm?: boolean; // Cờ để biết đây là dialog xác nhận hay chỉ thông báo
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {

    // inject dữ liệu và modalRef
    private data = inject(MODAL_DATA, { optional: true }) as DialogData | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    // ==========================================================
    // ===== ĐẢM BẢO BẠN CÓ 2 DÒNG KHAI BÁO SIGNAL NÀY =====
    // ==========================================================
    message = signal(this.data?.message ?? 'Are you sure?');
    isConfirm = signal(this.data?.isConfirm ?? false); // <--- LỖI LÀ DO THIẾU DÒNG NÀY

    // Xử lý sự kiện click nút
    ok() {
        this.modalRef.close(true); // Luôn trả về true khi nhấn OK
    }

    cancel() {
        this.modalRef.close(false); // Trả về false khi nhấn Hủy
    }
}