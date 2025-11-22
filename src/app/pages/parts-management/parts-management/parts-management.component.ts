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
  styleUrls: ['./parts-management.component.css'],
})
export class PartsManagementComponent implements OnInit {
  // Tabs
  activeTab = 'parts';

  // ================== PARTS ==================
  parts: SparePart[] = [];
  filteredParts: SparePart[] = [];

  carModels: CarModel[] = [];
  uniqueCarNames: string[] = [];
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
    this.loading = true;

    // Load parts trực tiếp
    this.inventoryService.getAllParts().subscribe({
      next: (data) => {
        this.parts = data.map((p) => {
          const carModelName = p.partNumber?.split('-')[0] ?? '';
          return {
            ...p,
            carModelName,
            stockQuantity: p.stockQuantity ?? 0,
            minStockLevel: p.minStockLevel ?? 0,
          };
        });

        // Tạo danh sách tên xe duy nhất từ partNumber
        this.uniqueCarNames = Array.from(
          new Set(this.parts.map((p) => p.partNumber?.split('-')[0]))
        ).filter((name): name is string => typeof name === 'string');

        this.filteredParts = this.parts;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Unable to load spare part data.';
        console.error('Error loading parts:', err);
      },
    });

    this.loadCenters();
  }


  // ================== PARTS ==================

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

  fetchParts(): void {
    this.loading = true;
    this.inventoryService.getAllParts().subscribe({
      next: (data) => {
        this.parts = data.map((p) => {
          const carModelName = p.partNumber?.split('-')[0] ?? '';
          return {
            ...p,
            carModelName,
            stockQuantity: p.stockQuantity ?? 0,
            minStockLevel: p.minStockLevel ?? 0,
          };
        });

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

    // 1. Search
    if (search) {
      result = result.filter(
        (part) =>
          part.partName?.toLowerCase().includes(search) ||
          part.partNumber?.toLowerCase().includes(search)
      );
    }

    // 2. Filter theo carModelName (VF3, VF5, ...)
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
    this.inventoryService
      .getInventoryByCenter(Number(this.selectedCenterId))
      .subscribe({
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
    console.log('Adjust clicked item:', item);

    const inventoryId = item.id ?? item.inventoryId ?? item.partId;

    if (!inventoryId) {
      console.warn('No inventoryId found for item:', item);
      return;
    }

    console.log('Inventory ID passed in:', inventoryId);

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
}
