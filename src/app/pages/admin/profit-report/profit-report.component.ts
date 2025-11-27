import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts'; // Cần import cái này nếu dùng chart

import { ReportService } from '../../../services/report.service';
import { ProfitReportResponse } from '../../../models/report.model';

// ApexCharts Options Type
export type ChartOptions = {
    series: any;
    chart: any;
    xaxis: any;
    stroke: any;
    dataLabels: any;
    fill: any;
    colors: any;
    tooltip: any;
};

@Component({
    selector: 'app-profit-report',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        NgApexchartsModule // Import module chart
    ],
    templateUrl: './profit-report.component.html',
})
export class ProfitReportComponent implements OnInit {

    startDate: string = '';
    endDate: string = '';

    reportData: ProfitReportResponse | null = null;
    isLoading: boolean = false;
    errorMessage: string = '';

    // Biến mới cho UI (Mock hoặc tính từ API)
    totalPackagesSold = 158;

    // Chart Configuration
    public chartOptions: Partial<ChartOptions> = {
        series: [{ name: "Revenue", data: [] }],
        chart: { type: "area", height: 320, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
        colors: ["#10b981"], // Emerald-500
        fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: { categories: [], labels: { style: { colors: '#9ca3af' } }, axisBorder: { show: false }, axisTicks: { show: false } },
        tooltip: { theme: 'light' }
    };

    constructor(private reportService: ReportService) {}

    ngOnInit(): void {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

        this.startDate = this.toDateInputValue(firstDay);
        this.endDate = this.toDateInputValue(today);

        this.onFilter();
    }

    private toDateInputValue(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    onFilter(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.reportService.getProfitReport(this.startDate, this.endDate).subscribe({
            next: (data) => {
                this.reportData = data;
                this.updateChart(data.monthlyBreakdown || []);
                this.isLoading = false;
            },
            error: (error) => {
                console.error('API Error:', error);
                this.errorMessage = 'Unable to load report data.';
                this.isLoading = false;
            }
        });
    }

    updateChart(monthlyData: any[]) {
        this.chartOptions = {
            ...this.chartOptions,
            series: [{
                name: "Revenue",
                data: monthlyData.map(item => Number(item.revenue))
            }],
            xaxis: {
                categories: monthlyData.map(item => item.month),
                labels: { style: { colors: '#9ca3af' } }
            }
        };
    }
}