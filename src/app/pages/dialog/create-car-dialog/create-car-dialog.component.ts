import {AfterViewInit, Component, inject, OnInit, signal} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {InputFieldComponent} from "../../../shared/components/form/input/input-field.component";
import {LabelComponent} from "../../../shared/components/form/label/label.component";
import {SelectComponent} from "../../../shared/components/form/select/select.component";
import {MODAL_DATA} from "../../modal/modal.token";
import {User} from "../../../models/user";
import {ModalRef} from "../../modal/modal-ref";
import {CarModelService} from "../../../services/car-model.service";
import {VehicleService} from "../../../services/vehicle.service";
import {VehicleCreate} from "../../../models/vehicle-create";

@Component({
  selector: 'app-create-car-dialog',
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent,
        SelectComponent
    ],
  templateUrl: './create-car-dialog.component.html',
  styleUrl: './create-car-dialog.component.css'
})
export class CreateCarDialogComponent implements OnInit, AfterViewInit {
    carModels: { value: string, label: string }[] = []
    selectedCarModel = '';
    licensePlate: string = '';
    vinNumber: string = '';
    licensePlateError: boolean = false;
    error: boolean = false;
    constructor(private carModelService: CarModelService,
                private vehicleService: VehicleService,) {
    }

    ngOnInit(): void {

    }

    ngAfterViewInit() {
        this.initCarModelData();
    }

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string, user?: User, isEdit?: boolean } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    initCarModelData() {
        this.carModelService.getAll().pipe().subscribe(res => {
            this.carModels = this.toOptions(res, 'id', 'carName');
        })
    }

    toOptions(list: any[], valueKey: string, labelKey: string) {
        return list.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    }

    handleSelectChange(value: string) {
        this.selectedCarModel = value;
    }

    ok() {
        const request: VehicleCreate = new VehicleCreate(
            Number(this.selectedCarModel),
            this.licensePlate,
            this.vinNumber
        );
        this.vehicleService.addVehicle(request).pipe().subscribe(res => {
            this.modalRef.close(true);
        });
    }

    cancel() {this.modalRef.close(false);}
}
