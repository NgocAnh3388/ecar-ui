import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalRef } from '../../modal/modal-ref';

@Component({
    selector: 'app-report-cost-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg w-[500px] shadow-xl">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Report Additional Cost</h2>
      
      <div class="space-y-4">
        <!-- Amount Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Amount (VND)</label>
          <input 
            type="number" 
            [(ngModel)]="amount" 
            class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder="Ex: 500000"
          >
        </div>
        
        <!-- Reason Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason / Issue Found</label>
          <textarea 
            [(ngModel)]="reason" 
            rows="4" 
            class="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" 
            placeholder="Describe the issue found during inspection..."
          ></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex justify-end gap-3">
        <button (click)="close()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white">
            Cancel
        </button>
        <button (click)="submit()" class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 dark:bg-red-600 dark:hover:bg-red-700">
            Send Request
        </button>
      </div>
    </div>
  `
})
export class ReportCostDialogComponent {
    amount: number | null = null;
    reason: string = '';

    private modalRef = inject(ModalRef);

    close() {
        this.modalRef.close(null);
    }

    submit() {
        if (this.amount && this.amount > 0 && this.reason.trim()) {
            this.modalRef.close({ amount: this.amount, reason: this.reason });
        } else {
            alert("Please enter a valid amount and reason.");
        }
    }
}