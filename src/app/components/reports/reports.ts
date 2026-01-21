import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { Property } from '../../models/property.model';
import { TransactionService } from '../../services/transaction-service';
import { PropertyService } from '../../services/property-service';
import { ReportService, ReportFilter, FinancialReport } from '../../services/report-service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  properties: Property[] = [];
  selectedProperty: Property | null = null;
  transactions: Transaction[] = [];
  
  // Filter options
  filter: ReportFilter = {
    propertyId: null,
    period: 'month',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    quarter: 1
  };
  
  // Report data
  report: FinancialReport | null = null;
  
  // Year options (last 5 years + current year + next year)
  years: number[] = [];
  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];
  quarters = [
    { value: 1, label: 'Q1 (Jan-Mar)' },
    { value: 2, label: 'Q2 (Apr-Jun)' },
    { value: 3, label: 'Q3 (Jul-Sep)' },
    { value: 4, label: 'Q4 (Oct-Dec)' }
  ];

  constructor(
    private transactionService: TransactionService,
    private propertyService: PropertyService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    // Generate year options
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      this.years.push(i);
    }
    
    // Load properties
    this.propertyService.getProperties().subscribe({
      next: (properties) => {
        this.properties = properties;
      },
      error: (error) => console.error('Error loading properties:', error)
    });
    
    // Subscribe to selected property
    this.propertyService.selectedProperty$.subscribe(property => {
      this.selectedProperty = property;
      this.filter.propertyId = property?.id || null;
    });
    
    // Load all transactions
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
      },
      error: (error) => console.error('Error loading transactions:', error)
    });
  }

  generateReport(): void {
    this.report = this.reportService.generateReport(this.transactions, this.filter);
  }

  exportReport(): void {
    if (!this.report) {
      alert('Please generate a report first');
      return;
    }
    
    const propertyName = this.getPropertyName();
    this.reportService.exportToCSV(this.report, propertyName);
  }

  onPeriodChange(): void {
    // Reset month/quarter when period changes
    if (this.filter.period === 'year') {
      this.filter.month = undefined;
      this.filter.quarter = undefined;
    } else if (this.filter.period === 'month') {
      this.filter.quarter = undefined;
      this.filter.month = new Date().getMonth() + 1;
    } else if (this.filter.period === 'quarter') {
      this.filter.month = undefined;
      this.filter.quarter = Math.floor(new Date().getMonth() / 3) + 1;
    }
  }

  onPropertyChange(): void {
    const property = this.properties.find(p => p.id === this.filter.propertyId);
    if (property) {
      this.propertyService.setSelectedProperty(property);
    } else {
      this.propertyService.setSelectedProperty(null);
    }
  }

  getPropertyName(): string {
    if (!this.filter.propertyId) {
      return 'All Properties';
    }
    const property = this.properties.find(p => p.id === this.filter.propertyId);
    return property?.name || 'Unknown Property';
  }

  getPeriodLabel(): string {
    if (this.filter.period === 'month' && this.filter.month) {
      const month = this.months.find(m => m.value === this.filter.month);
      return `${month?.label} ${this.filter.year}`;
    } else if (this.filter.period === 'quarter' && this.filter.quarter) {
      const quarter = this.quarters.find(q => q.value === this.filter.quarter);
      return `${quarter?.label} ${this.filter.year}`;
    } else {
      return `Year ${this.filter.year}`;
    }
  }
}
