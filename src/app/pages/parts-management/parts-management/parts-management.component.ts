import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Services
import { InventoryService } from '../../../services/inventory.service';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ModalService } from '../../modal/modal.service';

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

    // ================== USED PARTS DATA ==================
    usedParts: any[] = [];
    filteredUsedParts: any[] = [];
    usedPartSearchTerm: string = '';

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
        this.fetchParts();
        this.loadCenters();
        this.checkPermission();
    }

    checkPermission() {
        const roles = this.authService.getRoles();
        if (roles.includes('ROLE_STAFF') || roles.includes('STAFF')) {
            this.userRole = 'STAFF';
            this.disableCenterSelect = true;

            this.userService.getCurrentUser().subscribe((user: any) => {
                const centerId = user.centerId || user.center?.id;
                if (centerId) {
                    this.selectedCenterId = centerId.toString();
                    this.onCenterChange();
                }
            });
        } else {
            this.userRole = 'ADMIN';
            this.disableCenterSelect = false;
        }
    }

    // --- TAB LOGIC ---
    setActiveTab(tab: 'parts' | 'inventory' | 'used') {
        this.activeTab = tab;
        // Nếu chuyển sang tab Used và chưa có data thì load
        if (tab === 'used' && this.usedParts.length === 0) {
            this.loadUsedPartsHistory();
        }
    }

    // ================== PARTS LOGIC ==================

    fetchParts(): void {
        this.loading = true;
        this.inventoryService.getAllParts().subscribe({
            next: (data) => {
                this.parts = data.map((p) => {
                    const carModelName = p.partNumber?.split('-')[0] ?? '';
                    return { ...p, carModelName };
                });

                this.uniqueCarNames = Array.from(
                    new Set(this.parts.map((p) => p.partNumber?.split('-')[0]))
                ).filter((name): name is string => typeof name === 'string');

                this.applyFilters();
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = 'Unable to load spare part data.';
                console.error(err);
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
            data: { title: 'Edit Spare Part', partData: part, isEdit: true },
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
            if (confirmed) this.inventoryService.deletePart(part.id!).subscribe(() => this.fetchParts());
        });
    }

    // ================== INVENTORY LOGIC ==================

    loadCenters() {
        this.inventoryService.getCenters().subscribe({
            next: (res) => {
                this.centers = res;
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
        this.loading = true;
        this.inventoryService
            .getInventoryByCenter(Number(this.selectedCenterId))
            .subscribe({
                next: (res) => {
                    this.inventory = res;
                    this.filteredInventory = res;
                    this.applyInventoryFilter();
                    this.loading = false;
                },
                error: (err) => {
                    console.error(err);
                    this.loading = false;
                },
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
            data: { inventoryId: item.id, partName: item.partName, currentStock: item.stockQuantity },
        });
        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange();
        });
    }

    openAdjustDialog(item: any) {
        const modalRef = this.modal.open(AdjustDialogComponent, {
            data: {
                inventoryId: item.id,
                partName: item.partName,
                stockQuantity: item.stockQuantity,
                minStockLevel: item.minStockLevel,
            },
        });
        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange();
        });
    }

    // --- CHECK STOCK ACROSS CENTERS ---
    checkStockAcrossCenters(part: SparePart) {
        if (!part.id) return;

        this.inventoryService.getStockAcrossCenters(part.id).subscribe(data => {
            let message = `<div class="space-y-3 text-left">`;
            message += `<p class="text-sm text-gray-600">Stock availability for: <b class="text-gray-900">${part.partName}</b></p>`;

            if (data.length === 0) {
                message += `<p class="text-red-500 italic">No stock data found in any center.</p>`;
            } else {
                message += `<div class="border rounded-lg overflow-hidden"><table class="w-full text-sm text-left">
                    <thead class="bg-gray-50"><tr><th class="px-3 py-2">Center</th><th class="px-3 py-2 text-right">Stock</th></tr></thead>
                    <tbody>`;

                data.forEach((item: any) => {
                    const stockClass = item.stockQuantity > 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold';
                    message += `<tr class="border-t">
                        <td class="px-3 py-2">${item.centerName}</td>
                        <td class="px-3 py-2 text-right ${stockClass}">${item.stockQuantity}</td>
                    </tr>`;
                });
                message += `</tbody></table></div>`;
            }
            message += `</div>`;

            this.modal.open(ConfirmDialogComponent, {
                data: {
                    title: 'Stock Availability',
                    message: message,
                    isConfirm: false
                },
                panelClass: ['modal-panel', 'bg-white', 'rounded-xl', 'shadow-xl', 'max-w-md', 'w-full']
            });
        });
    }

    // ================== USED PARTS LOGIC ==================

    loadUsedPartsHistory() {
        this.loading = true;

        // --- CÁCH 1: GỌI API THẬT ---
        this.inventoryService.getUsedPartsHistory().subscribe({
            next: (data: any) => {
                // Nếu API trả về rỗng, ta thêm data giả để test UI (Chỉ dùng khi dev)
                if (!data || data.length === 0) {
                    this.usedParts = this.getMockUsedParts();
                } else {
                    this.usedParts = data;
                }
                this.applyUsedPartsFilter();
                this.loading = false;
            },
            error: (err: any) => {
                console.error(err);
                // Fallback data giả nếu lỗi
                this.usedParts = this.getMockUsedParts();
                this.applyUsedPartsFilter();
                this.loading = false;
            }
        });
    }

    // Hàm tạo data giả
    getMockUsedParts() {
        return [
            {
                serviceDate: new Date(),
                centerName: 'ECar Binh Duong',
                partName: 'Front Brake Pads',
                partNumber: 'VF5-BRK-01',
                licensePlate: '63-B6-51709',
                quantityUsed: 2,
                priceAtTimeOfUse: 800000
            },
            {
                serviceDate: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 ngày trước
                centerName: 'ECar Thu Duc',
                partName: 'Wiper Blade Kit',
                partNumber: 'VF5-WPR-01',
                licensePlate: '51G-123.45',
                quantityUsed: 1,
                priceAtTimeOfUse: 400000
            }
        ];
    }

    onUsedPartsCenterChange() {
        this.applyUsedPartsFilter();
    }

    applyUsedPartsFilter() {
        let result = this.usedParts;

        // Filter theo Center nếu có chọn
        if (this.selectedCenterId) {
            // Lưu ý: Backend trả về centerName chứ không phải centerId trong DTO UsedPartHistoryDTO
            // Nên ta cần tìm tên center tương ứng với ID đã chọn
            const selectedCenter = this.centers.find(c => c.id.toString() === this.selectedCenterId);
            if (selectedCenter) {
                result = result.filter(r => r.centerName === selectedCenter.centerName);
            }
        }

        // Filter theo từ khóa
        const term = this.usedPartSearchTerm.toLowerCase().trim();
        if (term) {
            result = result.filter(r =>
                (r.partName && r.partName.toLowerCase().includes(term)) ||
                (r.partNumber && r.partNumber.toLowerCase().includes(term)) ||
                (r.licensePlate && r.licensePlate.toLowerCase().includes(term))
            );
        }

        this.filteredUsedParts = result;
    }
}