import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../services/inventory.service';
import { SparePart } from '../../../models/spare-part.model';
import { CarModel } from '../../../models/car-model';
import { AddPartDialogComponent } from '../../dialog/add-part-dialog/add-part-dialog.component';
import { ModalService } from '../../modal/modal.service';
import { ConfirmDialogComponent } from '../../dialog/confirm-dialog/confirm-dialog.component';
import { RestockDialogComponent } from '../../dialog/restock-dialog/restock-dialog.component';
import { AdjustDialogComponent } from '../../dialog/adjust-dialog/adjust-dialog.component';

@Component({
    selector: 'app-parts-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './parts-management.component.html',
    styleUrls: ['./parts-management.component.css']
})
export class PartsManagementComponent implements OnInit {
    // Tabs
    activeTab = 'parts';

    // ================== PARTS ==================
    parts: SparePart[] = [];
    filteredParts: SparePart[] = [];
    carModels: CarModel[] = [];
    selectedCarModel = '';
    searchTerm = '';
    loading = false;
    errorMessage = '';

    // ================== INVENTORY ==================
    centers: any[] = [];
    selectedCenterId: string = '';
    inventory: any[] = [];
    filteredInventory: any[] = [];
    filterStatus = '';

    private modal = inject(ModalService);

    constructor(private inventoryService: InventoryService) {}

    ngOnInit(): void {
        this.fetchParts();
        this.fetchCarModels();
        this.loadCenters();

        if (this.activeTab === 'inventory' && this.selectedCenterId) {
            this.onCenterChange();
        }
    }

    // ================== PARTS ==================

    // Thêm mới phụ tùng
    openAddDialog() {
        const modalRef = this.modal.open(AddPartDialogComponent, {
            data: { title: 'Add New Spare Part' },
        });
        modalRef.afterClosed$.subscribe((result) => {
            if (result) this.fetchParts();
        });
    }

    // Chỉnh sửa phụ tùng
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

    // Xóa phụ tùng
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

    fetchParts(): void {
        this.loading = true;
        this.inventoryService.getAllParts().subscribe({
            next: (data) => {
                this.parts = data.map((p) => ({
                    ...p,
                    stockQuantity: p.stockQuantity ?? 0,
                    minStockLevel: p.minStockLevel ?? 0,
                }));
                this.filteredParts = this.parts;
                this.loading = false;
            },
            error: (err) => {
                this.loading = false;
                this.errorMessage = 'Không thể tải dữ liệu phụ tùng.';
                console.error('Error loading parts:', err);
            },
        });
    }

    fetchCarModels(): void {
        this.inventoryService.getCarModels().subscribe({
            next: (models) =>
                (this.carModels = models.map((m) =>
                    CarModel.fromJSON(JSON.stringify(m))
                )),
            error: (err) => console.error('Error loading car models:', err),
        });
    }

    applyFilters(): void {
        this.filteredParts = this.parts.filter((part) => {
            const matchSearch =
                !this.searchTerm ||
                part.partName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                part.partNumber?.toLowerCase().includes(this.searchTerm.toLowerCase());
            const matchCar =
                !this.selectedCarModel ||
                part.carModelName?.toLowerCase() ===
                this.selectedCarModel.toLowerCase();
            return matchSearch && matchCar;
        });
    }

    onSearchChange(event: Event): void {
        this.searchTerm = (event.target as HTMLInputElement).value;
        this.applyFilters();
    }

    onCarModelChange(event: Event): void {
        const select = event.target as HTMLSelectElement;
        this.selectedCarModel = select.value;
        this.applyFilters();
    }

    // ================== INVENTORY ==================

    loadCenters() {
        this.inventoryService.getCenters().subscribe({
            next: (res) => {
                this.centers = res;
                if (res.length > 0 && !this.selectedCenterId) {
                    this.selectedCenterId = res[0].id.toString();
                    this.onCenterChange();
                }
            },
            error: (err) => console.error('Load centers failed', err),
        });
    }

    onCenterChange() {
        if (!this.selectedCenterId) return;
        this.inventoryService.getInventoryByCenter(Number(this.selectedCenterId)).subscribe({
            next: (res) => {
                this.inventory = res;
                this.filteredInventory = res;
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
        console.log('Item when restock:', item);
        const modalRef = this.modal.open(RestockDialogComponent, {
            data: { inventoryId: item.inventoryId ?? item.id },
        });
        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange();
        });
    }

    openAdjustDialog(item: any) {
        console.log("Adjust clicked item:", item);

        // Dùng chính item.id (đã là inventoryId), fallback nếu null
        const inventoryId = item.id ?? item.inventoryId ?? item.partId;

        if (!inventoryId) {
            console.warn('⚠️ Không tìm thấy inventoryId cho item:', item);
            return;
        }

        console.log("✅ Inventory ID truyền vào:", inventoryId);

        const modalRef = this.modal.open(AdjustDialogComponent, {
            data: {
                inventoryId: inventoryId,
                stockQuantity: item.stockQuantity,
                minStockLevel: item.minStockLevel,
            },
        });

        modalRef.afterClosed$.subscribe((res) => {
            if (res) this.onCenterChange(); // reload
        });
    }

}
