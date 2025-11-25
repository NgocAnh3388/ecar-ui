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

@Component({
    selector: 'app-service-detail-dialog',
    standalone: true, // Đảm bảo component là standalone nếu dùng imports
    imports: [
        SelectComponent,
        ButtonComponent
    ],
    templateUrl: './service-detail-dialog.component.html',
    styleUrl: './service-detail-dialog.component.css'
})
export class ServiceDetailDialogComponent implements OnInit, AfterViewInit {

    numOfKm: number = 0;
    carModelId: number = 0;
    ticketId: number = 0;

    formTitle = 'Service Details';
    leftTitle = 'Maintenance Service Groups';
    rightTitle = 'Repair Service Groups';

    milestoneOptions: { value: string, label: string }[] = []
    technicianOptions: { value: string, label: string }[] = []
    selectedMilestone: string = '1';
    value: string | null = null;

    // ====== Splitter logic ======
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
        milestoneId: number
    } | null;

    private modalRef = inject<ModalRef<boolean>>(ModalRef);

    maintenanceGroup: ServiceGroup[] = []
    serviceGroup: ServiceGroup[] = []
    technician: User[] = []
    checkedServiceIds: number[] = []
    selectedTechnician: string = ''

    constructor(private maintenanceService: MaintenanceService,
                private userService: UserService,
                private cdr: ChangeDetectorRef) {
    }

    ngOnInit(): void {
    }

    ngAfterViewInit() {
        this.numOfKm = this.data?.numOfKm ?? 0;
        this.carModelId = this.data?.carModelId ?? 0;
        this.ticketId = this.data?.ticketId ?? 0;
        this.selectedTechnician = this.data?.technicianId ? this.data?.technicianId.toString() : '1'

        this.initMilestoneData();
        this.initServiceGroup();
        this.initTechnician();
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
        const request: ServiceCreateRequest = new ServiceCreateRequest(
            this.ticketId,
            this.numOfKm,
            Number(this.selectedMilestone),
            Number(this.selectedTechnician),
            this.checkedServiceIds
        )
        // SỬA LỖI TYPE Ở ĐÂY: (res: any)
        this.maintenanceService.createService(request).subscribe((res: any) => {
            this.modalRef.close(true);
        })
    }

    initMilestoneData() {
        // SỬA LỖI TYPE Ở ĐÂY: (res: any)
        this.maintenanceService.getMilestone(this.carModelId).subscribe((res: any) => {
            this.milestoneOptions = this.toOptions(res, 'id', 'kilometerAt', 'yearAt');

            this.selectedMilestone = this.data?.milestoneId
                ? this.data?.milestoneId.toString()
                : (this.milestoneOptions[0]?.value || '1');

            this.initMaintenanceServiceGroup(this.selectedMilestone);
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
        this.initMaintenanceServiceGroup(value);
        this.selectedMilestone = value;
    }

    initMaintenanceServiceGroup(value: string) {
        // SỬA LỖI TYPE Ở ĐÂY: (res: any)
        this.maintenanceService.getMaintenanceServiceGroup(this.carModelId, Number(value))
            .subscribe((res: any) => {
                this.maintenanceGroup = res;
            })
    }

    initServiceGroup() {
        // SỬA LỖI TYPE Ở ĐÂY: (res: any)
        this.maintenanceService.getServiceGroup(this.ticketId).subscribe((res: any) => {
            this.serviceGroup = res;
        })
    }

    initTechnician() {
        // SỬA LỖI TYPE Ở ĐÂY: (res: any)
        this.userService.getUsersByRole('technician').subscribe((res: any) => {
            this.technicianOptions = this.toOptionsTwoParam(res, 'id', 'fullName');
        })
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