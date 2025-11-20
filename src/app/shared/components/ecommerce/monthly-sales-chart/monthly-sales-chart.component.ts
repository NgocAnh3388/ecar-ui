import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'; // 1. Thêm Input, OnChanges
import { NgApexchartsModule, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexPlotOptions, ApexDataLabels, ApexStroke, ApexLegend, ApexYAxis, ApexGrid, ApexFill, ApexTooltip } from 'ng-apexcharts';
import { DropdownComponent } from '../../ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../ui/dropdown/dropdown-item/dropdown-item.component';

@Component({
    selector: 'app-monthly-sales-chart',
    standalone: true,
    imports: [
        CommonModule,
        NgApexchartsModule,
        DropdownComponent,
        DropdownItemComponent,
    ],
    templateUrl: './monthly-sales-chart.component.html'
})
export class MonthlySalesChartComponent implements OnChanges { // 2. Implements OnChanges

    // 3. KHAI BÁO INPUT ĐỂ NHẬN DỮ LIỆU TỪ CHA (PROFIT REPORT)
    @Input() chartData: { categories: string[], data: number[] } | null = null;

    public series: ApexAxisChartSeries = [
        {
            name: 'Sales',
            data: [], // Để trống ban đầu
        },
    ];

    public chart: ApexChart = {
        fontFamily: 'Outfit, sans-serif',
        type: 'bar',
        height: 180,
        toolbar: { show: false },
    };

    public xaxis: ApexXAxis = {
        categories: [], // Để trống ban đầu
        axisBorder: { show: false },
        axisTicks: { show: false },
    };

    public plotOptions: ApexPlotOptions = {
        bar: {
            horizontal: false,
            columnWidth: '39%',
            borderRadius: 5,
            borderRadiusApplication: 'end',
        },
    };
    public dataLabels: ApexDataLabels = { enabled: false };
    public stroke: ApexStroke = {
        show: true,
        width: 4,
        colors: ['transparent'],
    };
    public legend: ApexLegend = {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: 'Outfit',
    };
    public yaxis: ApexYAxis = { title: { text: undefined } };
    public grid: ApexGrid = { yaxis: { lines: { show: true } } };
    public fill: ApexFill = { opacity: 1 };
    public tooltip: ApexTooltip = {
        x: { show: false },
        y: { formatter: (val: number) => `${val}` },
    };
    public colors: string[] = ['#465fff'];

    isOpen = false;

    toggleDropdown() {
        this.isOpen = !this.isOpen;
    }

    closeDropdown() {
        this.isOpen = false;
    }

    // 4. HÀM NÀY CHẠY KHI DỮ LIỆU TỪ CHA THAY ĐỔI
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chartData'] && this.chartData) {
            this.updateChart();
        }
    }

    // 5. CẬP NHẬT BIỂU ĐỒ VỚI DỮ LIỆU MỚI
    updateChart() {
        if (!this.chartData) return;

        this.series = [{
            name: 'Doanh thu',
            data: this.chartData.data
        }];

        this.xaxis = {
            ...this.xaxis,
            categories: this.chartData.categories
        };
    }
}