import { AfterViewInit, Component } from '@angular/core';
import { BadgeComponent } from '../../../shared/components/ui/badge/badge.component';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';
import { catchError, EMPTY, finalize } from 'rxjs';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { ModalService } from '../../modal/modal.service';
import { MaintenanceDialogComponent } from '../../dialog/maintenance-dialog/maintenance-dialog.component';
import { CreateCarDialogComponent } from '../../dialog/create-car-dialog/create-car-dialog.component';

@Component({
    selector: 'app-customer-schedule',
    standalone: true,
    imports: [BadgeComponent, ButtonComponent, DatePipe, DecimalPipe, NgClass],
    templateUrl: './customer-schedule.component.html',
    styleUrls: ['./customer-schedule.component.css'],
})
export class CustomerScheduleComponent implements AfterViewInit {
    vehicleData: Vehicle[] = [];

    constructor(
        private vehicleService: VehicleService,
        private modal: ModalService
    ) {}

    ngAfterViewInit() {
        this.getVehicleData();
    }

    getVehicleData() {
        this.vehicleService
            .getVehicles()
            .pipe(
                finalize(() => {}),
                catchError((err) => {
                    console.error(err);
                    return EMPTY;
                })
            )
            .subscribe((res) => {
                this.vehicleData = res;
            });
        //mock test màu
//     this.vehicleData = [
//       new Vehicle({
//         id: 1,
//         licensePlate: '30A-12345',
//         vinNumber: '4Y1SL65848Z411440',
//         carModel: { carName: 'VF7', carType: 'SUV' },
//         nextDate: new Date('2025-12-25'),
//         nextKm: 20000,
//         oldDate: new Date('2025-09-25'),
//         oldKm: 15000
//       }),
//       new Vehicle({
//         id: 2,
//         licensePlate: '30B-67890',
//         vinNumber: 'JH4KA9650MC012345',
//         carModel: { carName: 'VF3', carType: 'Hatchback' },
//         nextDate: new Date('2025-11-20'),
//         nextKm: 18000,
//         oldDate: new Date('2025-10-05'),
//         oldKm: 13000
//       }),
//       new Vehicle({
//         id: 3,
//         licensePlate: '30C-99999',
//         vinNumber: '1HGCM82633A123456',
//         carModel: { carName: 'Accent', carType: 'Sedan' },
//         nextDate: new Date('2025-10-10'),
//         nextKm: 16000,
//         oldDate: new Date('2025-08-10'),
//         oldKm: 12000
//       })
//     ];
    }


    getBadgeColor(_: string): 'success' | 'warning' | 'error' {
        return 'success';
    }

    schedule(id: number) {
        const ref = this.modal.open(MaintenanceDialogComponent, {
            data: {
                title: 'Schedule maintenance',
                message: '',
                vehicle: this.vehicleData.find((v) => v.id === id),
            },
            panelClass: ['modal-panel', 'p-0'],
            backdropClass: 'modal-backdrop',
            disableClose: false,
        });

        ref.afterClosed$.subscribe((confirmed) => {
            if (confirmed) this.getVehicleData();
        });
    }


    getBadgeClass(nextDate: string | Date | null): string {
        if (!nextDate) return 'bg-gray-100 text-gray-600';

        const today = new Date();
        const target = nextDate instanceof Date ? nextDate : new Date(nextDate);
        const diffDays = Math.ceil((target.getTime() - today.getTime()) / (1000 * 3600 * 24));

        if (diffDays < 0) return 'bg-red-100 text-red-700';
        if (diffDays <= 30) return 'bg-yellow-100 text-yellow-700';
        return 'bg-green-100 text-green-700';
    }


}
