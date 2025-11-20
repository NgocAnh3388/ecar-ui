import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ReportService } from '../../../services/report.service';
import { ProfitReportResponse } from '../../../models/report.model';

import { MonthlySalesChartComponent } from '../../../shared/components/ecommerce/monthly-sales-chart/monthly-sales-chart.component';

@Component({
    selector: 'app-profit-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MonthlySalesChartComponent
    ],
    templateUrl: './profit-report.component.html',
})
export class ProfitReportComponent implements OnInit {

    startDate: string = '';
    endDate: string = '';

    reportData: ProfitReportResponse | null = null;
    isLoading: boolean = false;
    errorMessage: string = '';

    salesChartData: { categories: string[], data: number[] } = { categories: [], data: [] };

    constructor(private reportService: ReportService) {}

    ngOnInit(): void {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        // Always format as YYYY-MM-DD
        this.startDate = this.toDateInputValue(firstDay);
        this.endDate = this.toDateInputValue(today);

        this.fetchData();
    }

    // ENFORCE FORMAT YYYY-MM-DD
    private toDateInputValue(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    fetchData(): void {
        this.isLoading = true;
        this.errorMessage = '';

        // Ensure dates sent to API are always valid (YYYY-MM-DD)
        this.startDate = this.toDateInputValue(new Date(this.startDate));
        this.endDate = this.toDateInputValue(new Date(this.endDate));

        this.reportService.getProfitReport(this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.reportData = data;

                if (data.monthlyBreakdown?.length > 0) {
                    this.salesChartData = {
                        categories: data.monthlyBreakdown.map(item => item.month),
                        data: data.monthlyBreakdown.map(item => Number(item.revenue))
                    };
                } else {
                    this.salesChartData = { categories: [], data: [] };
                }

                this.isLoading = false;
            },
            error: (error) => {
                console.error('Lỗi API:', error);
                this.errorMessage = 'Không thể tải báo cáo. Vui lòng kiểm tra kết nối.';
                this.isLoading = false;
            }
        });
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    }
}
