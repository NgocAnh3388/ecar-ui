import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { MaintenanceService } from '../../../services/maintenance.service';
import { VehicleService } from '../../../services/vehicle.service';
import { CenterService } from '../../../services/center.service';
import { ToastService } from '../../toast/toast.service';

// Models
import { MaintenanceScheduleRequest } from '../../../models/schedule-request';
import { Vehicle } from '../../../models/vehicle';
import { Center } from '../../../models/center';

@Component({
    selector: 'app-customer-schedule',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './customer-schedule.component.html',
    styleUrls: ['./customer-schedule.component.css']
})
export class CustomerScheduleComponent implements OnInit {
    scheduleForm: FormGroup;
    myVehicles: Vehicle[] = [];
    centers: Center[] = [];
    isLoading = false;
    minDate: string = '';

    private fb = inject(FormBuilder);
    private maintenanceService = inject(MaintenanceService);
    private vehicleService = inject(VehicleService);
    private centerService = inject(CenterService);
    private toastService = inject(ToastService);
    private router = inject(Router);

    constructor() {
        this.scheduleForm = this.fb.group({
            centerId: [null, Validators.required],
            scheduleDate: ['', [Validators.required, this.futureDateValidator()]],
            scheduleTime: ['', [Validators.required, this.businessHoursValidator()]],
            vehicleId: [null, Validators.required],
            licensePlate: [{value: '', disabled: true}],
            carModel: [{value: '', disabled: true}],
            vinNumber: [{value: '', disabled: true}],
            // Bỏ validate required cho Km vì khách không cần nhập
            numOfKm: [0],
            isMaintenance: [true],
            isRepair: [false],
            remark: ['']
        });
    }

    ngOnInit() {
        this.setMinDate();
        this.loadData();
        this.setupFormListeners();
    }

    setMinDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        this.minDate = `${year}-${month}-${day}`;
    }

    futureDateValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            const selectedDate = new Date(control.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selectedDate < today ? { pastDate: true } : null;
        };
    }

    businessHoursValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            const [hours, minutes] = control.value.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;
            const openTime = 8 * 60;  // 08:00
            const closeTime = 21 * 60; // 21:00
            if (totalMinutes < openTime || totalMinutes > closeTime) {
                return { outOfBusinessHours: true };
            }
            return null;
        };
    }

    loadData() {
        this.vehicleService.getVehicles().subscribe({
            next: (res: any) => this.myVehicles = res,
            error: (err: any) => console.error(err)
        });

        this.centerService.getAllCenters().subscribe({
            next: (res: any) => this.centers = res,
            error: (err: any) => console.error(err)
        });
    }

    setupFormListeners() {
        this.scheduleForm.get('vehicleId')?.valueChanges.subscribe(val => {
            const vehicleId = Number(val);
            const selectedCar = this.myVehicles.find(v => v.id === vehicleId);
            if (selectedCar) {
                this.scheduleForm.patchValue({
                    licensePlate: selectedCar.licensePlate,
                    carModel: selectedCar.carModel?.carName,
                    vinNumber: selectedCar.vinNumber,
                    // Vẫn lưu tạm giá trị cũ nếu có, nhưng không hiển thị cho user sửa
                    numOfKm: selectedCar.nextKm || 0
                });
            }
        });
    }

    onSubmit() {
        if (this.scheduleForm.invalid) {
            this.scheduleForm.markAllAsTouched();
            this.toastService.error('Please fill in all required fields correctly.');
            return;
        }

        const vehicleId = Number(this.scheduleForm.get('vehicleId')?.value);
        this.isLoading = true;

        this.maintenanceService.getHistory({ searchValue: '', page: 0, size: 100 }).subscribe({
            next: (res: any) => {
                const activeTicket = res.content?.find((t: any) =>
                    (t.vehicleId === vehicleId || t.licensePlate === this.scheduleForm.get('licensePlate')?.value) &&
                    !['DONE', 'CANCELLED', 'COMPLETED', 'TECHNICIAN_COMPLETED'].includes(t.status)
                );

                if (activeTicket) {
                    this.toastService.error('This vehicle has an ongoing service.');
                    this.isLoading = false;
                    return;
                }
                this.createAppointment();
            },
            error: (err: any) => {
                console.error(err);
                this.createAppointment();
            }
        });
    }

    createAppointment() {
        const formData = this.scheduleForm.getRawValue();

        let timeStr = formData.scheduleTime;
        if (timeStr && timeStr.length === 5) {
            timeStr += ':00';
        }

        const rawDate = formData.scheduleDate;
        let dateStr = rawDate;
        if (rawDate && rawDate.includes('-')) {
            const [year, month, day] = rawDate.split('-');
            dateStr = `${day}-${month}-${year}`;
        }

        const request: MaintenanceScheduleRequest = {
            centerId: Number(formData.centerId),
            scheduleDate: dateStr,
            scheduleTime: timeStr,
            vehicleId: Number(formData.vehicleId),
            numOfKm: 0, // Mặc định gửi 0 vì khách không nhập
            isMaintenance: !!formData.isMaintenance,
            isRepair: !!formData.isRepair,
            remark: formData.remark || ''
        };

        console.log('Sending Request Payload:', request);

        this.maintenanceService.createSchedule(request).subscribe({
            next: () => {
                this.toastService.success('Booking successful!');
                setTimeout(() => this.router.navigate(['/customer-maintenance']), 1500);
            },
            error: (err: any) => {
                this.isLoading = false;
                console.error('Backend Error:', err);
                const msg = err.error?.message || 'Booking failed. Please try again.';
                this.toastService.error(msg);
            }
        });
    }
}