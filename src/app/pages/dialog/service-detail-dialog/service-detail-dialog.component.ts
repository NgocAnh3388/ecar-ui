import {Component, HostListener, inject, OnInit} from '@angular/core';
import {SelectComponent} from "../../../shared/components/form/select/select.component";
import {ButtonComponent} from "../../../shared/components/ui/button/button.component";
import {MODAL_DATA} from "../../modal/modal.token";
import {Vehicle} from "../../../models/vehicle";
import {ModalRef} from "../../modal/modal-ref";
import {MaintenanceService} from "../../../services/maintenance.service";
import {ServiceGroup} from "../../../models/service-group";
import {User} from "../../../models/user";
import {UserService} from "../../../services/user.service";
import {ServiceCreateRequest} from "../../../models/service-create-request";


type CheckboxItem = { key: string; label: string; checked: boolean };
type Group = { id: string; title: string; open: boolean; items: CheckboxItem[] };
@Component({
  selector: 'app-service-detail-dialog',
    imports: [
        SelectComponent,
        ButtonComponent
    ],
  templateUrl: './service-detail-dialog.component.html',
  styleUrl: './service-detail-dialog.component.css'
})
export class ServiceDetailDialogComponent implements OnInit {

    numOfKm: number = 0;
    carModelId: number = 0;
    ticketId: number = 0;

    formTitle = 'Chi tiết dịch vụ';
    leftTitle = 'Nhóm dịch vụ bảo dưỡng';
    rightTitle = 'Nhóm dịch vụ sửa chữa';

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

    private data = inject(MODAL_DATA, { optional: true }) as { title?: string;
        message?: string, carModelId: number,
        numOfKm: number, ticketId: number, technicianId: number } | null;
    private modalRef = inject<ModalRef<boolean>>(ModalRef);


    maintenanceGroup: ServiceGroup[] = []
    serviceGroup: ServiceGroup[] = []
    technician: User[] = []
    checkedServiceIds: number[] = []
    selectedTechnician: string = ''

    constructor(private maintenanceService: MaintenanceService,
                private userService: UserService,) {
    }

    ngOnInit(): void {
        this.numOfKm = this.data?.numOfKm ?? 0;
        this.carModelId = this.data?.carModelId ?? 0;
        this.ticketId = this.data?.ticketId ?? 0;
        this.selectedTechnician = this.data?.technicianId ? this.data?.technicianId.toString() : '1'
        this.initMaintenanceServiceGroup(this.selectedMilestone);
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
        this.maintenanceService.createService(request).pipe().subscribe(res => {
            this.modalRef.close(true);
        })
    }

    initMilestoneData() {
        this.maintenanceService.getMilestone(this.carModelId).pipe().subscribe(res => {
            this.milestoneOptions = this.toOptions(res, 'id', 'kilometerAt', 'yearAt');
        })
    }

    toOptions(list: any[], valueKey: string, labelKey1: string, labelKey2: string) {
        return list.map(item => ({
            value: item[valueKey],
            label: 'Cấp ' + item[labelKey2] + ' / ' + item[labelKey1] + ' km'
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
    }

    initMaintenanceServiceGroup(value: string) {
        this.maintenanceService.getMaintenanceServiceGroup(this.carModelId, Number(value)).pipe().subscribe(res => {
            this.maintenanceGroup = res;
        })
    }

    initServiceGroup() {
        this.maintenanceService.getServiceGroup(this.ticketId).pipe().subscribe(res => {
            this.serviceGroup = res;
        })
    }

    initTechnician() {
        this.userService.getUsersByRole('technician').pipe().subscribe(res => {
            this.technicianOptions = this.toOptionsTwoParam(res, 'id', 'fullName');
        })
    }

    getTitle(category: string) {
        switch (category){
            case "general":
                return "Hạng mục chung"
            case "replace":
                return "Thay thế hoặc bảo dưỡng"
            case "cooling":
                return "Hệ thống làm mát"
            case "other":
                return "Khác"
            case "electric":
                return "Hệ thống điện, điều hoà"
            case "steering":
                return "Hệ thống lái"
            case "suspension":
                return "Hệ thống treo, gầm"
            case "interior":
                return "Hệ thống nội thất"
            case "brake":
                return "Hệ thống phanh"
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
}
