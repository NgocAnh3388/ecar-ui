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
import {finalize} from "rxjs/operators"; // <-- 1. Import `finalize`
import { CommonModule } from '@angular/common'; // <-- 1. Import CommonModule
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
@Component({
    selector: 'app-renew-dialog',
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent,
        CommonModule, // <-- 3. Thêm CommonModule vào đây
        LoadingSpinnerComponent // <-- 4. Thêm LoadingSpinnerComponent vào đây
    ],
    standalone: true, // <-- 5. Rất có thể bạn cần thêm dòng này
    templateUrl: './renew-dialog.component.html',
    styleUrl: './renew-dialog.component.css'
})
export class RenewDialogComponent {
    numOfYears = 1;
    public isLoading = false; // <-- 2. Thêm biến quản lý trạng thái loading

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

        // Bỏ đi .pipe(finalize(...))
        this.subscriptionService.renew(request)
            .subscribe({
                next: (res) => {
                    // KHI THÀNH CÔNG: Cứ để spinner và chuyển trang ngay lập tức.
                    // Trình duyệt sẽ tự lo việc xóa spinner khi trang mới được tải.
                    window.location.href = res.url;
                },
                error: (err) => {
                    console.error('Lỗi khi gia hạn:', err);

                    // KHI LỖI: Bắt buộc phải tắt spinner đi để người dùng có thể thao tác lại.
                    this.isLoading = false; // <--- SỬA ĐỔI QUAN TRỌNG

                    alert('Đã có lỗi xảy ra. Vui lòng thử lại.');
                    // Không đóng modal để người dùng có thể thử lại
                }
            });
    }

    cancel() {
        if (this.isLoading) { // Không cho hủy khi đang xử lý
            return;
        }
        this.modalRef.close(false);
    }
}