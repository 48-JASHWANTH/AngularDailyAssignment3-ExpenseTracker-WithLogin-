import { Injectable } from '@angular/core';
import { Transaction, CategoryExpense } from '../models/transaction.model';

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface ChartData {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
  profitData: number[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  constructor() { }

  /**
   * Get expense breakdown by category
   */
  getExpenseByCategory(transactions: Transaction[]): CategoryExpense[] {
    const expenseMap = new Map<string, number>();
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = expenseMap.get(t.category) || 0;
        expenseMap.set(t.category, current + t.amount);
      });
    
    return Array.from(expenseMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
  }

  /**
   * Aggregate transactions by month
   */
  getMonthlyData(transactions: Transaction[]): MonthlyData[] {
    const monthlyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expense: 0 });
      }
      
      const data = monthlyMap.get(monthKey)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Aggregate transactions by quarter
   */
  getQuarterlyData(transactions: Transaction[]): MonthlyData[] {
    const quarterlyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const quarterKey = `${year}-Q${quarter}`;
      
      if (!quarterlyMap.has(quarterKey)) {
        quarterlyMap.set(quarterKey, { income: 0, expense: 0 });
      }
      
      const data = quarterlyMap.get(quarterKey)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
    });
    
    return Array.from(quarterlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Aggregate transactions by year
   */
  getYearlyData(transactions: Transaction[]): MonthlyData[] {
    const yearlyMap = new Map<string, { income: number; expense: number }>();
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const yearKey = String(date.getFullYear());
      
      if (!yearlyMap.has(yearKey)) {
        yearlyMap.set(yearKey, { income: 0, expense: 0 });
      }
      
      const data = yearlyMap.get(yearKey)!;
      if (t.type === 'income') {
        data.income += t.amount;
      } else {
        data.expense += t.amount;
      }
    });
    
    return Array.from(yearlyMap.entries())
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        profit: data.income - data.expense
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Prepare chart-ready data from monthly/quarterly/yearly data
   */
  prepareChartData(data: MonthlyData[]): ChartData {
    return {
      labels: data.map(d => d.month),
      incomeData: data.map(d => d.income),
      expenseData: data.map(d => d.expense),
      profitData: data.map(d => d.profit)
    };
  }
}
