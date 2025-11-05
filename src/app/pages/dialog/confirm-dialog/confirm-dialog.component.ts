import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MODAL_DATA} from "../../modal/modal.token";
import {ModalRef} from "../../modal/modal-ref";


@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    ok() { this.modalRef.close(true); }
    cancel() { this.modalRef.close(false); }
}
