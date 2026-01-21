import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction, TransactionSummary, CategoryExpense } from '../../models/transaction.model';
import { Property } from '../../models/property.model';
import { TransactionService } from '../../services/transaction-service';
import { PropertyService } from '../../services/property-service';
import { DashboardService, MonthlyData } from '../../services/dashboard-service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  @ViewChild('cashflowCanvas') cashflowCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('expenseCanvas') expenseCanvas?: ElementRef<HTMLCanvasElement>;

  selectedProperty: Property | null = null;
  transactions: Transaction[] = [];
  summary: TransactionSummary = { totalIncome: 0, totalExpense: 0, netProfit: 0 };
  
  // Chart data
  cashflowPeriod: 'monthly' | 'quarterly' | 'yearly' = 'monthly';
  monthlyData: MonthlyData[] = [];
  categoryExpenses: CategoryExpense[] = [];
  
  loading = false;

  constructor(
    private transactionService: TransactionService,
    private propertyService: PropertyService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.propertyService.selectedProperty$.subscribe(property => {
      this.selectedProperty = property;
      this.loadDashboardData();
    });
  }

  ngAfterViewInit(): void {
    // Charts will be rendered after data is loaded
  }

  loadDashboardData(): void {
    this.loading = true;
    const propertyId = this.selectedProperty?.id || null;
    
    this.transactionService.getTransactionsByPropertyAndDate(propertyId).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.summary = this.transactionService.calculateSummary(transactions);
        this.updateChartData();
        this.loading = false;
        
        // Render charts after data is ready
        setTimeout(() => {
          this.renderCashflowChart();
          this.renderExpenseChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  updateChartData(): void {
    // Update cashflow data based on selected period
    if (this.cashflowPeriod === 'monthly') {
      this.monthlyData = this.dashboardService.getMonthlyData(this.transactions);
    } else if (this.cashflowPeriod === 'quarterly') {
      this.monthlyData = this.dashboardService.getQuarterlyData(this.transactions);
    } else {
      this.monthlyData = this.dashboardService.getYearlyData(this.transactions);
    }
    
    // Update expense breakdown
    this.categoryExpenses = this.dashboardService.getExpenseByCategory(this.transactions);
  }

  onPeriodChange(): void {
    this.updateChartData();
    this.renderCashflowChart();
  }

  renderCashflowChart(): void {
    if (!this.cashflowCanvas) return;
    
    const canvas = this.cashflowCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.monthlyData.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Simple bar chart implementation
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / (this.monthlyData.length * 3);
    const maxValue = Math.max(
      ...this.monthlyData.map(d => Math.max(d.income, d.expense))
    );

    // Draw axes
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();

    // Draw bars
    this.monthlyData.forEach((data, index) => {
      const x = padding + (index * 3 * barWidth);
      const incomeHeight = (data.income / maxValue) * chartHeight;
      const expenseHeight = (data.expense / maxValue) * chartHeight;

      // Income bar
      ctx.fillStyle = '#28a745';
      ctx.fillRect(x, canvas.height - padding - incomeHeight, barWidth * 0.9, incomeHeight);

      // Expense bar
      ctx.fillStyle = '#dc3545';
      ctx.fillRect(x + barWidth, canvas.height - padding - expenseHeight, barWidth * 0.9, expenseHeight);

      // Labels
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(x + barWidth, canvas.height - padding + 10);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(data.month, 0, 0);
      ctx.restore();
    });

    // Legend
    ctx.fillStyle = '#28a745';
    ctx.fillRect(canvas.width - 150, 20, 15, 15);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Income', canvas.width - 130, 32);

    ctx.fillStyle = '#dc3545';
    ctx.fillRect(canvas.width - 150, 40, 15, 15);
    ctx.fillStyle = '#333';
    ctx.fillText('Expense', canvas.width - 130, 52);
  }

  renderExpenseChart(): void {
    if (!this.expenseCanvas) return;
    
    const canvas = this.expenseCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (this.categoryExpenses.length === 0) {
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No expense data', canvas.width / 2, canvas.height / 2);
      return;
    }

    // Simple pie chart
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;
    const total = this.categoryExpenses.reduce((sum, c) => sum + c.amount, 0);
    
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    let currentAngle = -Math.PI / 2;

    this.categoryExpenses.forEach((category, index) => {
      const sliceAngle = (category.amount / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.fillStyle = colors[index % colors.length];
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + (radius + 20) * Math.cos(labelAngle);
      const labelY = centerY + (radius + 20) * Math.sin(labelAngle);
      
      ctx.fillStyle = '#333';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(category.category, labelX, labelY);
      ctx.fillText(`₹${category.amount.toFixed(0)}`, labelX, labelY + 12);

      currentAngle += sliceAngle;
    });
  }

  get propertyName(): string {
    return this.selectedProperty?.name || 'All Properties';
  }
}
