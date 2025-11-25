import { Component, inject, OnInit, signal } from '@angular/core';
import { ButtonComponent } from "../../../shared/components/ui/button/button.component";
import { InputFieldComponent } from "../../../shared/components/form/input/input-field.component";
import { LabelComponent } from "../../../shared/components/form/label/label.component";
import { SelectComponent } from "../../../shared/components/form/select/select.component";
import { MODAL_DATA } from "../../modal/modal.token";
import { ModalRef } from "../../modal/modal-ref";
import { CarModelService } from "../../../services/car-model.service";
// Xóa import VehicleService vì không dùng ở đây nữa

@Component({
    selector: 'app-create-car-dialog',
    standalone: true, // Thêm dòng này nếu chưa có
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent,
        SelectComponent
    ],
    templateUrl: './create-car-dialog.component.html',
    styleUrl: './create-car-dialog.component.css'
})
export class CreateCarDialogComponent implements OnInit {
    carModels: { value: string, label: string }[] = [];

    // Form data
    selectedCarModel = '';
    licensePlate: string = '';
    vinNumber: string = '';

    // Error flags
    licensePlateError: boolean = false;
    vinError: boolean = false; // Thêm validate VIN nếu cần
    modelError: boolean = false;

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string } | null;
    private modalRef = inject<ModalRef<any>>(ModalRef); // Sửa thành ModalRef<any>

    title = signal(this.data?.title ?? 'Add Vehicle');

    constructor(private carModelService: CarModelService) {}

    ngOnInit() {
        this.initCarModelData();
    }

    initCarModelData() {
        this.carModelService.getAll().subscribe(res => {
            this.carModels = this.toOptions(res, 'id', 'carName');
        });
    }

    toOptions(list: any[], valueKey: string, labelKey: string) {
        return list.map(item => ({
            value: item[valueKey].toString(), // Convert ID sang string cho SelectComponent
            label: item[labelKey]
        }));
    }

    // --- Event Handlers ---
    handleSelectChange(value: string) {
        this.selectedCarModel = value;
        this.modelError = false;
    }

    handleLicensePlateChange(value: string | number) {
        this.licensePlate = value.toString();
        this.licensePlateError = !this.licensePlate.trim();
    }

    handleVinChange(value: string | number) {
        this.vinNumber = value.toString();
        this.vinError = !this.vinNumber.trim() || this.vinNumber.length !== 17;
    }

    // --- Actions ---
    ok() {
        // 1. Validate
        let isValid = true;
        if (!this.selectedCarModel) {
            this.modelError = true;
            isValid = false;
        }
        if (!this.licensePlate.trim()) {
            this.licensePlateError = true;
            isValid = false;
        }
        if (!this.vinNumber.trim() || this.vinNumber.length !== 17) {
            this.vinError = true;
            isValid = false;
        }

        if (!isValid) return;

        // 2. Prepare data object
        const vehicleData = {
            carModelId: Number(this.selectedCarModel),
            licensePlate: this.licensePlate,
            vinNumber: this.vinNumber
        };

        // 3. Close dialog and return data
        this.modalRef.close(vehicleData);
    }

    cancel() {
        this.modalRef.close(null);
    }
}