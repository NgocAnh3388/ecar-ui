import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { SelectComponent } from '../../../shared/components/form/select/select.component';
import { CarModelService } from '../../../services/car-model.service';
import { InventoryService } from '../../../services/inventory.service';
import { ModalRef } from '../../modal/modal-ref';
import { MODAL_DATA } from '../../modal/modal.token';

@Component({
    selector: 'app-add-part-dialog',
    standalone: true,
    imports: [ButtonComponent, InputFieldComponent, LabelComponent, SelectComponent],
    templateUrl: './add-part-dialog.component.html',
    styleUrl: './add-part-dialog.component.css',
})
export class AddPartDialogComponent implements OnInit {
    carModels: { value: string; label: string }[] = [];
    selectedCarModel = '';
    partNumber = '';
    partName = '';
    category = '';
    unitPrice = 0;
    stockQuantity = 0;
    minStockLevel = 0;
    error = false;

    private modalRef = inject<ModalRef<boolean>>(ModalRef);
    private carModelService = inject(CarModelService);
    private inventoryService = inject(InventoryService);
    private data = inject(MODAL_DATA, { optional: true }) as any;

    title = signal(this.data?.title ?? '➕ Add New Spare Part');

    ngOnInit() {
        this.loadCarModels();

        // Nếu là chế độ EDIT thì load dữ liệu cũ
        if (this.data?.isEdit && this.data.partData) {
            const p = this.data.partData;
            this.partNumber = p.partNumber;
            this.partName = p.partName;
            this.category = p.category;
            this.unitPrice = p.unitPrice;
            this.stockQuantity = p.stockQuantity ?? 0; // ⚡ default 0 nếu null
            this.minStockLevel = p.minStockLevel ?? 0; // ⚡ default 0 nếu null
            this.selectedCarModel = p.carModelId?.toString();
        }
    }

    loadCarModels() {
        this.carModelService.getAll().subscribe({
            next: (res) => {
                this.carModels = res.map((m: any) => ({
                    value: m.id,
                    label: `${m.carName} - ${m.carType}`,
                }));
            },
            error: (err) => console.error('Error loading car models:', err),
        });
    }

    handleSelectChange(value: string) {
        this.selectedCarModel = value;
    }

    save() {
        // Đảm bảo không null
        this.stockQuantity = this.stockQuantity ?? 0;
        this.minStockLevel = this.minStockLevel ?? 0;

        if (
            !this.partNumber ||
            !this.partName ||
            !this.category ||
            !this.unitPrice ||
            !this.selectedCarModel
        ) {
            this.error = true;
            return;
        }

        const body = {
            partNumber: this.partNumber.trim(),
            partName: this.partName.trim(),
            category: this.category.trim(),
            unitPrice: this.unitPrice,
            stockQuantity: Number(this.stockQuantity) || 0,
            minStockLevel: Number(this.minStockLevel) || 0,
            carModelId: Number(this.selectedCarModel),
        };

        // 🔧 Nếu là EDIT → PUT
        if (this.data?.isEdit && this.data.partData?.id) {
            console.log('🔧 Updating part:', body);
            this.inventoryService.updatePart(this.data.partData.id, body).subscribe({
                next: () => {
                    console.log('Updated successfully');
                    this.modalRef.close(true);
                },
                error: (err) => {
                    console.error('Update failed:', err);
                    this.error = true;
                },
            });
        }
        // ➕ Nếu là ADD → POST
        else {
            console.log('Creating part:', body);
            this.inventoryService.createPart(body).subscribe({
                next: () => {
                    console.log('Created successfully');
                    this.modalRef.close(true);
                },
                error: (err) => {
                    console.error('Create failed:', err);
                    this.error = true;
                },
            });
        }
    }

    cancel() {
        this.modalRef.close(false);
    }
}
