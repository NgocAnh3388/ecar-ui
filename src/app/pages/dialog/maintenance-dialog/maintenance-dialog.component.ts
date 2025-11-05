import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    inject,
    Input, OnDestroy, OnInit,
    Output,
    signal,
    ViewChild
} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {InputFieldComponent} from "../../../shared/components/form/input/input-field.component";
import {LabelComponent} from "../../../shared/components/form/label/label.component";
import {SelectComponent} from "../../../shared/components/form/select/select.component";
import {CheckboxComponent} from "../../../shared/components/form/input/checkbox.component";
import {TextAreaComponent} from "../../../shared/components/form/input/text-area.component";
import {MODAL_DATA} from "../../modal/modal.token";
import {User} from "../../../models/user";
import {ModalRef} from "../../modal/modal-ref";
import flatpickr from "flatpickr";
import {CenterService} from "../../../services/center.service";
import {Center} from "../../../models/center";
import {catchError, EMPTY, finalize} from "rxjs";
import {UserService} from "../../../services/user.service";
import {Vehicle} from "../../../models/vehicle";
import {ScheduleRequest} from "../../../models/schedule-request";
import {MaintenanceService} from "../../../services/maintenance.service";

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

    private flatpickrInstance: flatpickr.Instance | undefined;

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

    centers: { value: string, label: string }[] = []
    private data = inject(MODAL_DATA, { optional: true }) as { title?: string; message?: string, vehicle: Vehicle } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);


    constructor(private centerService: CenterService,
                private userService: UserService,
                private maintenanceService: MaintenanceService,) {
    }

    ngOnInit(): void {
        this.getCenter();
        this.getUserInfo();
        this.initVehicleData()
    }

    getCenter() {
        this.centerService.getCenter().pipe(
            finalize(() => {  }),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.centers = this.toOptions(res, 'id', 'centerName');
        })
    }

    getUserInfo() {
        this.userService.getInfo().pipe(
            finalize(() => {  }),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.fullName = res.fullName;
            this.phoneNo = res.phoneNo;
            this.email = res.email;
        })
    }

    initVehicleData() {
        if (this.data?.vehicle) {
            this.vehicleId = this.data?.vehicle.id
            this.selectedVehicle = this.data?.vehicle.carModel.carName
            this.licensePlate = this.data?.vehicle.licensePlate
        }
    }

    ngAfterViewInit() {
        this.flatpickrInstance = flatpickr(this.dateInput.nativeElement, {
            mode: this.mode,
            static: true,
            monthSelectorType: 'static',
            dateFormat: 'd-m-Y',
            defaultDate: this.defaultDate,
            onChange: (selectedDates, dateStr, instance) => {
                this.dateChange.emit({ selectedDates, dateStr, instance });
                this.dateStr = dateStr;
            }
        });

        this.flatpickrInstance = flatpickr(this.timeInput.nativeElement, {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',   // time format HH:mm
            time_24hr: true,    // set true for 24hr clock
            minuteIncrement: 1,
            defaultDate: this.defaultTime,
            appendTo: document.body,
            onOpen: (_sel, _str, instance) => this.bumpZIndex(instance),
            onChange: (selectedDates, dateStr) => {
                this.timeChange.emit(dateStr); // emit "HH:mm"
                this.timeStr = dateStr;
            }
        });
    }

    ngOnDestroy() {
        if (this.flatpickrInstance) {
            this.flatpickrInstance.destroy();
        }
    }

    title = signal(this.data?.title ?? 'Xác nhận');
    message = signal(this.data?.message ?? 'Bạn chắc chắn?');

    handleFullNameChange(value: string | number) {
        this.fullName = value.toString();
        this.fullNameError = !(this.fullName.trim() !== '');
    }

    handlePhoneNoChange(value: string | number) {
        this.phoneNo = value.toString();
        this.phoneNoError = !(this.phoneNo.trim() !== '');
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

    ok(){
        const request: ScheduleRequest = new ScheduleRequest(
            Number(this.selectedCenter),
            this.timeInput.nativeElement.value,
            this.dateInput.nativeElement.value,
            this.vehicleId,
            this.inputKm,
            this.isMaintenance,
            this.isRepair,
            this.remark
        );
        console.log(request);
        this.maintenanceService.createSchedule(request).pipe(
            finalize(() => {  }),
            catchError(err => {
                console.error(err);
                return EMPTY;
            })
        ).subscribe(res => {
            this.modalRef.close(true);
        })
    }

    cancel(){ this.modalRef.close(false); }

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
