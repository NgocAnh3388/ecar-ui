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

    // Dùng any[] để tránh lỗi strict mode khi binding dữ liệu phức tạp
    myBookings: any[] = [];

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
            numOfKm: [0],
            isMaintenance: [true],
            isRepair: [false],
            remark: ['']
        });
    }

    ngOnInit() {
        this.setMinDate();
        this.loadData();
        this.loadMyBookings();
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
                    numOfKm: selectedCar.nextKm || 0
                });
            }
        });
    }

    // Load danh sách lịch sử (Thay cho BookingService)
    loadMyBookings() {
        this.maintenanceService.getMaintenanceHistory('', 100, 0).subscribe({
            next: (res: any) => {
                // Xử lý dữ liệu trả về (có thể là res.content hoặc res)
                const list = res.content || res || [];

                // Sort giảm dần theo ngày
                this.myBookings = list.sort((a: any, b: any) => {
                    const dateA = new Date(a.scheduleDate || 0).getTime();
                    const dateB = new Date(b.scheduleDate || 0).getTime();
                    return dateB - dateA;
                });
            },
            error: (err: any) => console.error('Error loading bookings:', err)
        });
    }

    // Xử lý hủy đơn
    onCancelBooking(bookingId: number) {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            this.isLoading = true;
            this.maintenanceService.cancelTicket(bookingId).subscribe({
                next: (res: any) => {
                    this.toastService.success('Appointment cancelled successfully!');
                    this.isLoading = false;

                    // Cập nhật UI ngay lập tức
                    const index = this.myBookings.findIndex(b => b.id === bookingId);
                    if (index !== -1) {
                        this.myBookings[index].status = 'CANCELLED';
                    }
                },
                error: (err: any) => {
                    this.isLoading = false;
                    const msg = err.error?.message || 'Failed to cancel appointment.';
                    this.toastService.error(msg);
                }
            });
        }
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
            numOfKm: 0,
            isMaintenance: !!formData.isMaintenance,
            isRepair: !!formData.isRepair,
            remark: formData.remark || ''
        };

        this.maintenanceService.createSchedule(request).subscribe({
            next: () => {
                this.toastService.success('Booking successful!');
                this.loadMyBookings(); // Load lại bảng bên dưới
                this.scheduleForm.reset();
                this.isLoading = false;
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