import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { FormsModule } from '@angular/forms';
import { ModalRef } from '../../modal/modal-ref';
import { MODAL_DATA } from '../../modal/modal.token';
import { InventoryService } from '../../../services/inventory.service';

@Component({
    selector: 'app-adjust-dialog',
    standalone: true,
    imports: [ButtonComponent, InputFieldComponent, LabelComponent, FormsModule],
    templateUrl: './adjust-dialog.component.html',
})
export class AdjustDialogComponent {
    stockQuantity = 0;
    minStockLevel = 0;

    private modalRef = inject<ModalRef<boolean>>(ModalRef);
    private inventoryService = inject(InventoryService);
    private data = inject(MODAL_DATA, { optional: true }) as
        | { inventoryId: number; stockQuantity: number; minStockLevel: number }
        | null;

    ngOnInit() {
        if (this.data) {
            this.stockQuantity = this.data.stockQuantity;
            this.minStockLevel = this.data.minStockLevel;
        }
    }

    save() {
        console.log('🧩 AdjustDialog data:', this.data);
        console.log('🧩 Values:', { stockQuantity: this.stockQuantity, minStockLevel: this.minStockLevel });

        if (!this.data?.inventoryId) return;

        // Tính chênh lệch giữa giá trị mới và cũ
        const diff = this.stockQuantity - this.data.stockQuantity;

        // Nếu không thay đổi, bỏ qua luôn
        if (diff === 0) {
            console.log('No change in stock quantity');
            this.modalRef.close(false);
            return;
        }

        const payload = {
            isAddition: diff > 0,
            quantityChange: Math.abs(diff),
            minStockLevel: this.minStockLevel,
        };

        console.log("Sending adjust:", this.data.inventoryId, payload);

        this.inventoryService
            .updateStock(this.data.inventoryId, payload)
            .subscribe({
                next: () => this.modalRef.close(true),
                error: (err: any) => console.error('Adjust failed:', err),
            });
    }


    cancel() {
        this.modalRef.close(false);
    }
}
