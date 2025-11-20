import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input,
    OnDestroy,
    OnInit,
    Output,
    signal,
    ViewChild
} from '@angular/core';
import { ButtonComponent } from '../../../shared/components/ui/button/button.component';
import { InputFieldComponent } from '../../../shared/components/form/input/input-field.component';
import { LabelComponent } from '../../../shared/components/form/label/label.component';
import { SelectComponent } from '../../../shared/components/form/select/select.component';
import { CheckboxComponent } from '../../../shared/components/form/input/checkbox.component';
import { TextAreaComponent } from '../../../shared/components/form/input/text-area.component';
import { MODAL_DATA } from '../../modal/modal.token';
import { ModalRef } from '../../modal/modal-ref';
import flatpickr from 'flatpickr';
import { CenterService } from '../../../services/center.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { Vehicle } from '../../../models/vehicle';
import { ScheduleRequest } from '../../../models/schedule-request';
import { MaintenanceService } from '../../../services/maintenance.service';

@Component({
    selector: 'app-maintenance-dialog',
    imports: [
        ButtonComponent,
        InputFieldComponent,
        LabelComponent,
        SelectComponent,
        CheckboxComponent,
        TextAreaComponent
    ],
    templateUrl: './maintenance-dialog.component.html',
    styleUrl: './maintenance-dialog.component.css'
})
export class MaintenanceDialogComponent implements OnInit, AfterViewInit, OnDestroy {

    options = [
        { value: 'CUSTOMER', label: 'CUSTOMER' },
        { value: 'ADMIN', label: 'ADMIN' },
        { value: 'STAFF', label: 'STAFF' },
        { value: 'TECHNICIAN', label: 'TECHNICIAN' },
    ];

    @Input() id!: string;
    @Input() mode: 'single' | 'multiple' | 'range' | 'time' = 'single';
    @Input() defaultDate?: string | Date | string[] | Date[];
    @Input() label?: string;
    @Input() placeholder?: string;
    @Output() dateChange = new EventEmitter<any>();
    @ViewChild('dateInput', { static: false }) dateInput!: ElementRef<HTMLInputElement>;

    @Input() timeId!: string;
    @Input() timeLabel: string = 'Time Select Input';
    @Input() timePlaceholder: string = 'Select time';
    @Input() defaultTime?: string | Date;
    @Output() timeChange = new EventEmitter<string>();
    @ViewChild('timeInput', { static: false }) timeInput!: ElementRef<HTMLInputElement>;

    private datePickerInstance: flatpickr.Instance | undefined;
    private timePickerInstance: flatpickr.Instance | undefined;

    fullName = '';
    fullNameError = false;
    phoneNo = '';
    phoneNoError = false;
    email = '';
    emailError = false;
    selectedVehicle = '';
    vehicleId: number = 0;
    inputKm = 0;
    kmError = false;
    error = false;
    licensePlate = '';
    licensePlateError = false;
    remark = '';
    selectedCenter: string = '';
    isMaintenance = false;
    isRepair = false;
    dateStr: string = '';
    timeStr: string = '';

    centers: { value: string, label: string }[] = [];

    private data = inject(MODAL_DATA, { optional: true }) as {
        title?: string;
        message?: string;
        vehicle: Vehicle;
        user?: { fullName: string; email: string; phoneNo?: string };
    } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    constructor(
        private centerService: CenterService,
        private userService: UserService,
        private maintenanceService: MaintenanceService
    ) {}

    ngOnInit(): void {
        this.getCenters();
        this.initVehicleData();
        this.initUserData();
    }

    getCenters() {
        this.centerService.getCenter().pipe(
            finalize(() => {}),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.centers = this.toOptions(res, 'id', 'centerName');
        });
    }

    getUserInfo() {
        this.userService.getInfo().pipe(
            finalize(() => {}),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.fullName = res.fullName;
            this.phoneNo = res.phoneNo;
            this.email = res.email;
        });
    }

    initVehicleData() {
        if (this.data?.vehicle) {
            this.vehicleId = this.data.vehicle.id;
            this.selectedVehicle = this.data.vehicle.carModel.carName;
            this.licensePlate = this.data.vehicle.licensePlate;
        }
    }

    initUserData() {
        if (this.data?.user) {
            this.fullName = this.data.user.fullName;
            this.email = this.data.user.email;
            this.phoneNo = this.data.user.phoneNo ?? '';
        } else {
            this.getUserInfo();
        }
    }

    ngAfterViewInit() {
        if (this.dateInput) {
            this.datePickerInstance = flatpickr(this.dateInput.nativeElement, {
                mode: this.mode,
                static: true,
                monthSelectorType: 'static',
                dateFormat: 'd-m-Y',
                defaultDate: this.defaultDate,
                minDate: 'today',
                onChange: (selectedDates, dateStr, instance) => {
                    this.dateChange.emit({ selectedDates, dateStr, instance });
                    this.dateStr = dateStr;
                },
            });
        }

        if (this.timeInput) {
            this.timePickerInstance = flatpickr(this.timeInput.nativeElement, {
                enableTime: true,
                noCalendar: true,
                dateFormat: 'H:i',
                time_24hr: true,
                minuteIncrement: 1,
                defaultDate: this.defaultTime,
                minTime: '07:00',
                maxTime: '20:00',
                appendTo: document.body,
                onOpen: (_sel, _str, instance) => this.bumpZIndex(instance),
                onChange: (selectedDates, dateStr) => {
                    this.timeChange.emit(dateStr);
                    this.timeStr = dateStr;
                },
            });
        }
    }

    ngOnDestroy() {
        if (this.datePickerInstance) this.datePickerInstance.destroy();
        if (this.timePickerInstance) this.timePickerInstance.destroy();
    }

    title = signal(this.data?.title ?? 'Confirmation');
    message = signal(this.data?.message ?? 'Are you sure?');

    handleFullNameChange(value: string | number) {
        this.fullName = value.toString();
        this.fullNameError = this.fullName.trim() === '';
    }

    handlePhoneNoChange(value: string | number) {
        this.phoneNo = value.toString();
        this.phoneNoError = this.phoneNo.trim() === '';
    }

    validateEmail(value: string): boolean {
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
        this.emailError = !isValidEmail;
        return isValidEmail;
    }

    handleEmailChange(value: string | number) {
        this.email = value.toString();
        this.validateEmail(this.email);
    }

    handleCenterChange(value: string) {
        this.selectedCenter = value;
    }

    ok() {
        const selectedDate = this.dateInput.nativeElement.value;
        const selectedTime = this.timeInput.nativeElement.value;

        if (!selectedDate || !selectedTime) {
            alert('Please select both date and time before booking.');
            return;
        }

        const [day, month, year] = selectedDate.split('-').map(Number);
        const [hour, minute] = selectedTime.split(':').map(Number);
        const combinedDateTime = new Date(year, month - 1, day, hour, minute);

        const now = new Date();
        if (combinedDateTime < now) {
            alert('You cannot book a time in the past. Please select a future date and time.');
            return;
        }

        const request: ScheduleRequest = new ScheduleRequest(
            Number(this.selectedCenter),
            selectedTime,
            selectedDate,
            this.vehicleId,
            this.inputKm,
            this.isMaintenance,
            this.isRepair,
            this.remark
        );

        this.maintenanceService.createSchedule(request).pipe(
            finalize(() => {}),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(() => {
            this.modalRef.close(true);
        });
    }

    cancel() {
        this.modalRef.close(false);
    }

    toOptions(list: any[], valueKey: string, labelKey: string) {
        return list.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    }

    private bumpZIndex(instance: flatpickr.Instance) {
        try {
            const cal = instance?.calendarContainer as HTMLElement;
            if (cal) cal.style.zIndex = '9999';
        } catch {}
    }
}
