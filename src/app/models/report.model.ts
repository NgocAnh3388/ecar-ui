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
    netProfit: number;
    currency: string;
    monthlyBreakdown: MonthlyDetail[];
}