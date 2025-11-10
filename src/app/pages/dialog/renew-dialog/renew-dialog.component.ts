import {Component, inject, signal} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {InputFieldComponent} from "../../../shared/components/form/input/input-field.component";
import {LabelComponent} from "../../../shared/components/form/label/label.component";
import {MODAL_DATA} from "../../modal/modal.token";
import {Vehicle} from "../../../models/vehicle";
import {ModalRef} from "../../modal/modal-ref";
import {SubscriptionService} from "../../../services/subscription.service";
import {RenewRequest} from "../../../models/renew-request";
import {Router} from "@angular/router";
import { CommonModule } from '@angular/common';
import {LoadingSpinnerComponent} from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-renew-dialog',
    standalone: true,
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent,
        CommonModule,
        LoadingSpinnerComponent,
    ],
  templateUrl: './renew-dialog.component.html',
  styleUrl: './renew-dialog.component.css'
})
export class RenewDialogComponent {
    numOfYears = 1;
    public isLoading = false;

    constructor(private subscriptionService: SubscriptionService,
                private router: Router) {
    }

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string, vehicle: Vehicle } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    ok() {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true; // Bật spinner

        const request = new RenewRequest(this.numOfYears);
        this.subscriptionService.renew(request).subscribe({
            next: (res) => {
                // Giữ nguyên logic chuyển trang
                window.location.href = res.url;
            },
            error: (err) => {
                console.error('Failed to create payment link:', err);
                this.isLoading = false; // Tắt spinner khi có lỗi
                alert('Failed to create payment. Please try again.'); // Thông báo lỗi
            }
        });
    }

    cancel() {
        if (this.isLoading) return;
        this.modalRef.close(false);
    }

    // Hàm để xử lý input
    onYearsChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.numOfYears = parseInt(value, 10) || 1;
    }
}
