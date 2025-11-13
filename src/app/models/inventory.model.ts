export interface InventoryItem {
    id: number;
    centerId: number;
    centerName?: string;
    sparePartId: number;
    partName: string;
    partNumber: string;
    stockQuantity: number;
    minStockLevel: number;
}
