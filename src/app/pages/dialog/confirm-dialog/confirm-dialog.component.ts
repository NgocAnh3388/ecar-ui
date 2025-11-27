import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MODAL_DATA} from "../../modal/modal.token";
import {ModalRef} from "../../modal/modal-ref";
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';



@Component({
    selector: 'app-confirm-dialog',
    imports: [CommonModule, ButtonComponent],
    templateUrl: './confirm-dialog.component.html',
    styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Confirmation');
    message = signal(this.data?.message ?? 'Are you sure?');

    ok() { this.modalRef.close(true); }
    cancel() { this.modalRef.close(false); }
}
