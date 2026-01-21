import { Injectable } from '@angular/core';
import { Transaction, TransactionSummary } from '../models/transaction.model';

export interface ReportFilter {
  propertyId: number | null;
  period: 'month' | 'quarter' | 'year';
  year: number;
  month?: number; // 1-12
  quarter?: number; // 1-4
}

export interface FinancialReport {
  period: string;
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  transactions: Transaction[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportService {

  constructor() { }

  /**
   * Filter transactions based on report criteria
   */
  filterTransactions(transactions: Transaction[], filter: ReportFilter): Transaction[] {
    return transactions.filter(t => {
      const date = new Date(t.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 0-indexed to 1-indexed
      
      // Check property
      if (filter.propertyId !== null && t.propertyId !== filter.propertyId) {
        return false;
      }
      
      // Check year
      if (year !== filter.year) {
        return false;
      }
      
      // Check period
      if (filter.period === 'month' && filter.month) {
        return month === filter.month;
      } else if (filter.period === 'quarter' && filter.quarter) {
        const quarter = Math.floor((month - 1) / 3) + 1;
        return quarter === filter.quarter;
      } else if (filter.period === 'year') {
        return true; // Already filtered by year
      }
      
      return true;
    });
  }

  /**
   * Generate financial report
   */
  generateReport(transactions: Transaction[], filter: ReportFilter): FinancialReport {
    const filteredTransactions = this.filterTransactions(transactions, filter);
    
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpense;
    
    let period = '';
    if (filter.period === 'month' && filter.month) {
      period = `${filter.year}-${String(filter.month).padStart(2, '0')}`;
    } else if (filter.period === 'quarter' && filter.quarter) {
      period = `${filter.year}-Q${filter.quarter}`;
    } else {
      period = `${filter.year}`;
    }
    
    return {
      period,
      totalIncome,
      totalExpense,
      netProfit,
      transactions: filteredTransactions
    };
  }

  /**
   * Export report to CSV
   */
  exportToCSV(report: FinancialReport, propertyName: string = 'All Properties'): void {
    const csvRows: string[] = [];
    
    // Header
    csvRows.push(`Financial Report - ${propertyName}`);
    csvRows.push(`Period: ${report.period}`);
    csvRows.push('');
    csvRows.push(`Total Income,${report.totalIncome}`);
    csvRows.push(`Total Expense,${report.totalExpense}`);
    csvRows.push(`Net Profit,${report.netProfit}`);
    csvRows.push('');
    csvRows.push('Date,Type,Category,Amount,Notes');
    
    // Transactions
    report.transactions.forEach(t => {
      const row = [
        t.date,
        t.type,
        t.category,
        t.amount.toString(),
        `"${t.notes || ''}"`
      ].join(',');
      csvRows.push(row);
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${report.period}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
