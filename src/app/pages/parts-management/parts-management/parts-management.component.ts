import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { InventoryService } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ModalService } from '../../modal/modal.service'; // Đảm bảo path đúng tới ModalService của bạn

// Models
import { SparePart } from '../../../models/spare-part.model';
import { CarModel } from '../../../models/car-model';

// Dialogs
import { AddPartDialogComponent } from '../../dialog/add-part-dialog/add-part-dialog.component';
import { ConfirmDialogComponent } from '../../dialog/confirm-dialog/confirm-dialog.component';
import { RestockDialogComponent } from '../../dialog/restock-dialog/restock-dialog.component';
import { AdjustDialogComponent } from '../../dialog/adjust-dialog/adjust-dialog.component';

@Component({
    selector: 'app-parts-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './parts-management.component.html',
    styleUrls: ['./parts-management.component.css'],
})
export class PartsManagementComponent implements OnInit {
    // --- FIX LỖI TYPE TẠI ĐÂY ---
    // Thêm 'used' vào để khớp với HTML *ngIf="activeTab === 'used'"
    activeTab: 'parts' | 'inventory' | 'used' = 'inventory';

    // ================== PARTS DATA ==================
    parts: SparePart[] = [];
    filteredParts: SparePart[] = [];

    carModels: CarModel[] = [];
    uniqueCarNames: string[] = [];
    selectedCarModel = '';

    searchTerm = '';
    loading = false;
    errorMessage = '';

    // ================== INVENTORY DATA ==================
    centers: any[] = [];
    selectedCenterId: string = '';
    inventory: any[] = [];
    filteredInventory: any[] = [];
    filterStatus = '';

    // ================== PERMISSION ==================
    userRole: string = '';
    disableCenterSelect = false;

    private modal = inject(ModalService);

    constructor(
        private inventoryService: InventoryService,
        private authService: AuthService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.loading = true;

        // 1. Load danh sách phụ tùng (dữ liệu gốc)
        this.fetchParts();

        // 2. Load danh sách Center (để lọc kho)
        this.loadCenters();

        // 3. Phân quyền xem kho (Staff chỉ xem được kho của mình)
        const roles = this.authService.getRoles();
        if (roles.includes('ROLE_STAFF') || roles.includes('STAFF')) {
            this.userRole = 'STAFF';
            this.disableCenterSelect = true; // Khóa dropdown chọn center

            // Lấy thông tin Staff để biết Center ID của họ
            this.userService.getCurrentUser().subscribe((user: any) => {
                // Logic: user.centerId hoặc user.center.id tùy backend trả về
                const centerId = user.centerId || user.center?.id;
                if (centerId) {
                    this.selectedCenterId = centerId.toString();
                    this.onCenterChange(); // Load kho ngay lập tức
                }
            });
        } else {
            this.userRole = 'ADMIN';
            this.disableCenterSelect = false;
            // Admin có thể chọn bất kỳ center nào
        }
    }

    // Hàm chuyển tab
    setActiveTab(tab: 'parts' | 'inventory' | 'used') {
        this.activeTab = tab;
    }

    // ================== PARTS LOGIC ==================

    fetchParts(): void {
        this.loading = true;
        this.inventoryService.getAllParts().subscribe({
            next: (data) => {
                this.parts = data.map((p) => {
                    // Giả sử partNumber có format "CARNAME-XXX"
                    const carModelName = p.partNumber?.split('-')[0] ?? '';
                    return {
                        ...p,
                        carModelName,
                        stockQuantity: p.stockQuantity ?? 0,
                        minStockLevel: p.minStockLevel ?? 0,
                    };
                });

                // Lấy danh sách tên xe duy nhất để filter
                this.uniqueCarNames = Array.from(
                    new Set(this.parts.map((p) => p.partNumber?.split('-')[0]))
                ).filter((name): name is string => typeof name === 'string');

                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = 'Unable to load spare part data.';
                console.error('Error loading parts:', err);
            },
        });
    }

    applyFilters(): void {
        const search = this.searchTerm.trim().toLowerCase();
        let result = this.parts;

        if (search) {
            result = result.filter(
                (part) =>
                    part.partName?.toLowerCase().includes(search) ||
                    part.partNumber?.toLowerCase().includes(search)
            );
        }

        if (this.selectedCarModel) {
            result = result.filter(
                (part) => part.carModelName === this.selectedCarModel
            );
        }

        this.filteredParts = result;
    }

    onSearchChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
        this.applyFilters();
    }

    onCarModelChange(event: Event): void {
        this.selectedCarModel = (event.target as HTMLSelectElement).value;
        this.applyFilters();
    }

    openAddDialog() {
        const modalRef = this.modal.open(AddPartDialogComponent, {
            data: { title: 'Add New Spare Part' },
        });
        modalRef.afterClosed$.subscribe((result) => {
            if (result) this.fetchParts();
        });
    }

    openEditDialog(part: SparePart) {
        const modalRef = this.modal.open(AddPartDialogComponent, {
            data: {
                title: 'Edit Spare Part',
                partData: part,
                isEdit: true,
            },
        });
        modalRef.afterClosed$.subscribe((result) => {
            if (result) this.fetchParts();
        });
    }

    confirmDelete(part: SparePart) {
        const modalRef = this.modal.open(ConfirmDialogComponent, {
            data: {
                title: 'Confirm Delete',
                message: `Are you sure you want to delete <b>${part.partName}</b>?`,
            },
        });

        modalRef.afterClosed$.subscribe((confirmed) => {
            if (confirmed) this.deletePart(part.id!);
        });
    }

    deletePart(id: number) {
        this.inventoryService.deletePart(id).subscribe({
            next: () => this.fetchParts(),
            error: (err) => console.error('Delete failed:', err),
        });
    }

    // ================== INVENTORY LOGIC ==================

    loadCenters() {
        this.inventoryService.getCenters().subscribe({
            next: (res) => {
                this.centers = res;
                // Nếu là ADMIN và chưa chọn Center nào -> Chọn cái đầu tiên mặc định
                if (this.userRole !== 'STAFF' && res.length > 0 && !this.selectedCenterId) {
                    this.selectedCenterId = res[0].id.toString();
                    this.onCenterChange();
                }
            },
            error: (err) => console.error('Load centers failed', err),
        });
    }

    onCenterChange() {
        if (!this.selectedCenterId) return;
        this.inventoryService
            .getInventoryByCenter(Number(this.selectedCenterId))
            .subscribe({
                next: (res) => {
                    this.inventory = res;
                    this.filteredInventory = res;
                    this.applyInventoryFilter(); // Apply filter nếu đang chọn status
                },
                error: (err) => console.error('Error loading inventory:', err),
            });
    }

    applyInventoryFilter() {
        if (this.filterStatus === 'low') {
            this.filteredInventory = this.inventory.filter(
                (i) => i.stockQuantity <= i.minStockLevel && i.stockQuantity > 0
            );
        } else if (this.filterStatus === 'out') {
            this.filteredInventory = this.inventory.filter(
                (i) => i.stockQuantity === 0
            );
        } else {
            this.filteredInventory = this.inventory;
        }
    }

    openRestockDialog(item: any) {
        const modalRef = this.modal.open(RestockDialogComponent, {
            data: { inventoryId: item.inventoryId ?? item.id },
        });
        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange();
        });
    }

    openAdjustDialog(item: any) {
        // Cố gắng lấy inventoryId từ nhiều nguồn khác nhau của item
        const inventoryId = item.id ?? item.inventoryId ?? item.partId;
        if (!inventoryId) return;

        const modalRef = this.modal.open(AdjustDialogComponent, {
            data: {
                inventoryId: inventoryId,
                stockQuantity: item.stockQuantity,
                minStockLevel: item.minStockLevel,
            },
        });

        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange();
        });
    }

    // Thêm hàm này
    checkStockAcrossCenters(part: SparePart) {
        if (!part.id) return;

        // Gọi API lấy dữ liệu
        this.inventoryService.getStockAcrossCenters(part.id).subscribe(data => {
            // Format tin nhắn hiển thị (Hoặc làm 1 dialog table đẹp hơn)
            let message = `<div class="space-y-2">`;
            message += `<p class="font-bold text-gray-700">Stock for: ${part.partName}</p>`;
            message += `<ul class="list-disc pl-5 text-sm">`;

            data.forEach(item => {
                const colorClass = item.stockQuantity > 0 ? 'text-green-600' : 'text-red-600';
                message += `<li class="${colorClass}">
                <b>${item.centerName}:</b> ${item.stockQuantity} units
            </li>`;
            });
            message += `</ul></div>`;

            // Mở Dialog thông báo
            this.modal.open(ConfirmDialogComponent, {
                data: {
                    title: 'Inventory Across Centers',
                    message: message, // Cần ConfirmDialog hỗ trợ render HTML hoặc tạo component riêng
                    isConfirm: false // Chỉ hiện nút OK
                }
            });
        });
    }
}