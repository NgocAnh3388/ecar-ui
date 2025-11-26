import { AfterViewInit, ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { SelectComponent } from "../../../shared/components/form/select/select.component";
import { ButtonComponent } from "../../../shared/components/ui/button/button.component";
import { MODAL_DATA } from "../../modal/modal.token";
import { ModalRef } from "../../modal/modal-ref";
import { MaintenanceService } from "../../../services/maintenance.service";
import { ServiceGroup } from "../../../models/service-group";
import { User } from "../../../models/user";
import { UserService } from "../../../services/user.service";
import { ServiceCreateRequest } from "../../../models/service-create-request";
import { AuthService } from "../../../services/auth.service";

@Component({
    selector: 'app-service-detail-dialog',
    standalone: true,
    imports: [SelectComponent, ButtonComponent],
    templateUrl: './service-detail-dialog.component.html',
    styleUrl: './service-detail-dialog.component.css'
})
export class ServiceDetailDialogComponent implements OnInit {

    numOfKm: number = 0;
    carModelId: number = 0;
    ticketId: number = 0;
    formTitle = 'Service Details';
    leftTitle = 'Maintenance Service Groups';
    rightTitle = 'Repair Service Groups';
    milestoneOptions: { value: string, label: string }[] = [];
    technicianOptions: { value: string, label: string }[] = [];
    selectedMilestone: string = '1';
    rawMilestones: any[] = [];
    isStaff: boolean = false;

    // Biến control hiển thị
    showMaintenance: boolean = true;
    showRepair: boolean = true;

    leftFlex = '1 1 50%';
    rightFlex = '1 1 50%';
    private dragging = false;
    private startX = 0;
    private startLeftWidth = 0;
    private containerWidth = 0;

    private data = inject(MODAL_DATA, { optional: true }) as {
        title?: string;
        message?: string,
        carModelId: number,
        numOfKm: number,
        ticketId: number,
        technicianId: number,
        milestoneId: number,
        isMaintenance: boolean,
        isRepair: boolean
    } | null;

    private modalRef = inject<ModalRef<boolean>>(ModalRef);
    maintenanceGroup: ServiceGroup[] = [];
    serviceGroup: ServiceGroup[] = [];
    technician: User[] = [];
    checkedServiceIds: number[] = [];
    selectedTechnician: string = '';

    constructor(
        private maintenanceService: MaintenanceService,
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        private authService: AuthService
    ) {}

    ngOnInit(): void {
        this.numOfKm = this.data?.numOfKm ?? 0;
        this.carModelId = this.data?.carModelId ?? 0;
        this.ticketId = this.data?.ticketId ?? 0;
        this.selectedTechnician = this.data?.technicianId ? this.data?.technicianId.toString() : '';

        this.showMaintenance = this.data?.isMaintenance ?? true;
        this.showRepair = this.data?.isRepair ?? true;

        const roles = this.authService.getRoles();
        this.isStaff = roles.includes('ROLE_STAFF');

        if (!this.isStaff) {
            if (this.showMaintenance && !this.showRepair) {
                this.leftFlex = '1 1 100%';
                this.rightFlex = '0 0 0%';
            } else if (!this.showMaintenance && this.showRepair) {
                this.leftFlex = '0 0 0%';
                this.rightFlex = '1 1 100%';
            } else {
                this.leftFlex = '1 1 50%';
                this.rightFlex = '1 1 50%';
            }
        }

        this.initMilestoneData();

        if (!this.isStaff) {
            if (this.showRepair) {
                this.initServiceGroup();
            }
        }

        // Chỉ gọi API load Technician nếu là Staff
        if (this.isStaff) {
            this.initTechnician();
        }
    }

    get milestoneLabel(): string {
        const found = this.milestoneOptions.find(m => m.value == this.selectedMilestone);
        return found ? found.label : '';
    }

    onKmInput(event: Event) {
        if (!this.isStaff) return;
        const val = Number((event.target as HTMLInputElement).value);
        this.numOfKm = val;
        if (this.rawMilestones.length > 0) {
            let closest = this.rawMilestones[0];
            let minDiff = Math.abs(val - closest.kilometerAt);
            for (let i = 1; i < this.rawMilestones.length; i++) {
                const diff = Math.abs(val - this.rawMilestones[i].kilometerAt);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = this.rawMilestones[i];
                }
            }
            if (this.selectedMilestone !== closest.id.toString()) {
                this.selectedMilestone = closest.id.toString();
                this.initMaintenanceServiceGroup(this.selectedMilestone);
            }
        }
    }

    startDrag(ev: MouseEvent) {
        this.dragging = true;
        const container = (ev.target as HTMLElement).parentElement as HTMLElement;
        this.containerWidth = container.getBoundingClientRect().width;
        this.startX = ev.clientX;
        const leftPane = container.children.item(0) as HTMLElement;
        this.startLeftWidth = leftPane.getBoundingClientRect().width;
        document.body.classList.add('select-none');
    }

    @HostListener('document:mousemove', ['$event'])
    onMove(ev: MouseEvent) {
        if (!this.dragging) return;
        const dx = ev.clientX - this.startX;
        let newLeft = this.startLeftWidth + dx;
        const min = Math.max(240, this.containerWidth * 0.15);
        const max = this.containerWidth - min;
        newLeft = Math.min(Math.max(newLeft, min), max);
        const leftPct = (newLeft / this.containerWidth) * 100;
        this.leftFlex = `0 0 ${leftPct}%`;
        this.rightFlex = `0 0 ${100 - leftPct}%`;
    }

    @HostListener('document:mouseup')
    onUp() {
        if (!this.dragging) return;
        this.dragging = false;
        document.body.classList.remove('select-none');
    }

    onCancel() {
        this.modalRef.close(false);
    }

    onSubmit() {
        if (this.isStaff) {
            if (!this.numOfKm || this.numOfKm <= 0) {
                alert("Please enter valid vehicle kilometers.");
                return;
            }
            if (!this.selectedTechnician) {
                alert("Please assign a technician.");
                return;
            }
        }

        const request: ServiceCreateRequest = new ServiceCreateRequest(
            this.ticketId,
            this.numOfKm,
            Number(this.selectedMilestone),
            Number(this.selectedTechnician),
            this.checkedServiceIds
        )

        this.maintenanceService.createService(request).subscribe({
            next: (res: any) => {
                this.modalRef.close(true);
            },
            error: (err: any) => {
                console.error(err);
                const message = err.error?.message || "Failed to assign technician.";
                alert(message);
            }
        });
    }

    initMilestoneData() {
        this.maintenanceService.getMilestone(this.carModelId).subscribe((res: any) => {
            this.rawMilestones = res;
            this.milestoneOptions = this.toOptions(res, 'id', 'kilometerAt', 'yearAt');

            if (this.isStaff) {
                if(this.numOfKm > 0) {
                    this.onKmInput({ target: { value: this.numOfKm } } as any);
                } else {
                    this.selectedMilestone = this.milestoneOptions[0]?.value || '1';
                    this.initMaintenanceServiceGroup(this.selectedMilestone);
                }
            } else {
                this.selectedMilestone = this.data?.milestoneId
                    ? this.data?.milestoneId.toString()
                    : (this.milestoneOptions[0]?.value || '1');
                if(this.showMaintenance) {
                    this.initMaintenanceServiceGroup(this.selectedMilestone);
                }
            }
            this.cdr.markForCheck();
        })
    }

    toOptions(list: any[], valueKey: string, labelKey1: string, labelKey2: string) {
        return list.map(item => ({
            value: item[valueKey],
            label: 'Level ' + item[labelKey2] + ' / ' + item[labelKey1] + ' km'
        }));
    }

    toOptionsTwoParam(list: any[], valueKey: string, labelKey: string) {
        return list.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
        }));
    }

    handleMilestoneChange(value: string) {
        if (this.isStaff) return;
        this.initMaintenanceServiceGroup(value);
        this.selectedMilestone = value;
    }

    initMaintenanceServiceGroup(value: string) {
        this.maintenanceService.getMaintenanceServiceGroup(this.carModelId, Number(value))
            .subscribe((res: any) => {
                this.maintenanceGroup = res;
                this.cdr.markForCheck();
            })
    }

    initServiceGroup() {
        this.maintenanceService.getServiceGroup(this.ticketId).subscribe((res: any) => {
            this.serviceGroup = res;
            this.cdr.markForCheck();
        })
    }

    // --- HÀM MỚI: LOAD TECHNICIAN THEO CENTER ---
    initTechnician() {
        // Gọi hàm lấy Tech theo Center của Staff (đã thêm vào UserService)
        this.userService.getTechniciansByMyCenter().subscribe({
            next: (res: any) => {
                this.technicianOptions = this.toOptionsTwoParam(res, 'id', 'fullName');
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error("Failed to load technicians for center", err);
            }
        });
    }

    getTitle(category: string) {
        switch (category){
            case "general": return "General Items"
            case "replace": return "Replacement or Maintenance"
            case "cooling": return "Cooling System"
            case "other": return "Other"
            case "electric": return "Electrical & A/C System"
            case "steering": return "Steering System"
            case "suspension": return "Suspension/Chassis System"
            case "interior": return "Interior System"
            case "brake": return "Brake System"
        }
        return undefined;
    }

    handleCheckboxChange(id: number, event: Event) {
        if (this.isStaff) return;
        const inputEl = event.target as HTMLInputElement;
        const checked = inputEl.checked;
        if (checked) {
            this.checkedServiceIds.push(id);
        } else {
            const index = this.checkedServiceIds.indexOf(id);
            if (index !== -1) {
                this.checkedServiceIds.splice(index, 1);
            }
        }
    }

    handleSelectChange(val: string) {
        this.selectedTechnician = val;
    }
}