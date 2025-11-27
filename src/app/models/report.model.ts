export interface MonthlyDetail {
    month: string;      // "11/2024"
    revenue: number;
    expense: number;
    profit: number;
}

export interface ProfitReportResponse {
    startDate: string;
    endDate: string;

    totalRevenue: number;
    totalExpense: number;

    netProfit: number; // Backend trả về tên này
    profit?: number;   // Frontend có thể dùng tên này (alias) nếu cần

    currency: string;
    monthlyBreakdown: MonthlyDetail[];
}