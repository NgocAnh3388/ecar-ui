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

@Component({
  selector: 'app-renew-dialog',
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent
    ],
  templateUrl: './renew-dialog.component.html',
  styleUrl: './renew-dialog.component.css'
})
export class RenewDialogComponent {
    numOfYears = 1;

    constructor(private subscriptionService: SubscriptionService,
                private router: Router) {
    }

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string, vehicle: Vehicle } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    ok() {
        const request = new RenewRequest(this.numOfYears);
        this.subscriptionService.renew(request).pipe().subscribe(res => {
            window.location.href = res.url;

        })
    }
    cancel() { this.modalRef.close(false); }
}
