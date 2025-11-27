import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { FormsModule } from '@angular/forms';
import { ModalRef } from '../../modal/modal-ref';
import { MODAL_DATA } from '../../modal/modal.token';
import { InventoryService } from '../../../services/inventory.service';

@Component({
    selector: 'app-restock-dialog',
    standalone: true,
    imports: [ButtonComponent, InputFieldComponent, LabelComponent, FormsModule],
    templateUrl: './restock-dialog.component.html',
})
export class RestockDialogComponent {
    quantity: number = 0;

    private modalRef = inject<ModalRef<boolean>>(ModalRef);
    private inventoryService = inject(InventoryService);
    private modalData = inject(MODAL_DATA, { optional: true }) as any;

    save() {
        const inventoryId = this.modalData?.inventoryId ?? this.modalData?.data?.inventoryId;
        console.log('Saving restock...', { inventoryId, quantity: this.quantity, raw: this.modalData });

        if (!inventoryId || this.quantity <= 0) {
            console.warn('Invalid data', this.modalData);
            return;
        }

        this.inventoryService
            .updateStock(inventoryId, { isAddition: true, quantityChange: this.quantity })
            .subscribe({
                next: () => {
                    console.log('✅Restock success');
                    this.modalRef.close(true);
                },
                error: (err) => console.error('Restock failed:', err),
            });
    }

    cancel() {
        this.modalRef.close(false);
    }
}
