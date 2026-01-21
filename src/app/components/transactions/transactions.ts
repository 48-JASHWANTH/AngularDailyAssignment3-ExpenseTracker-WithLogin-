import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from '../../models/transaction.model';
import { Property } from '../../models/property.model';
import { TransactionService } from '../../services/transaction-service';
import { PropertyService } from '../../services/property-service';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  selectedProperty: Property | null = null;
  
  // Form data
  transactionForm: Partial<Transaction> = {
    type: 'income',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  };
  
  editMode = false;
  editingId: number | null = null;
  
  // Filter
  filterType: 'all' | 'income' | 'expense' = 'all';
  filterStartDate = '';
  filterEndDate = '';
  
  // Category options
  incomeCategories = ['Booking', 'Event', 'Rent', 'Other Income'];
  expenseCategories = ['Maintenance', 'Utilities', 'Supplies', 'Staff', 'Marketing', 'Other Expense'];

  constructor(
    private transactionService: TransactionService,
    private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    this.propertyService.selectedProperty$.subscribe(property => {
      this.selectedProperty = property;
      this.loadTransactions();
    });
  }

  loadTransactions(): void {
    const propertyId = this.selectedProperty?.id || null;
    
    this.transactionService.getTransactionsByPropertyAndDate(
      propertyId,
      this.filterStartDate,
      this.filterEndDate
    ).subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.applyFilters();
      },
      error: (error) => console.error('Error loading transactions:', error)
    });
  }

  applyFilters(): void {
    this.filteredTransactions = this.transactions.filter(t => {
      if (this.filterType !== 'all' && t.type !== this.filterType) {
        return false;
      }
      return true;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.loadTransactions();
  }

  addTransaction(): void {
    if (!this.selectedProperty) {
      alert('Please select a property first');
      return;
    }

    if (!this.transactionForm.category || !this.transactionForm.amount || this.transactionForm.amount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      propertyId: this.selectedProperty.id,
      type: this.transactionForm.type as 'income' | 'expense',
      category: this.transactionForm.category,
      amount: Number(this.transactionForm.amount),
      date: this.transactionForm.date!,
      notes: this.transactionForm.notes
    };

    this.transactionService.addTransaction(transaction).subscribe({
      next: () => {
        this.loadTransactions();
        this.resetForm();
        alert('Transaction added successfully!');
      },
      error: (error) => {
        console.error('Error adding transaction:', error);
        alert('Failed to add transaction. Please try again.');
      }
    });
  }

  editTransaction(transaction: Transaction): void {
    this.editMode = true;
    this.editingId = transaction.id;
    this.transactionForm = { ...transaction };
  }

  updateTransaction(): void {
    if (!this.editingId) return;

    this.transactionService.updateTransaction(this.editingId, this.transactionForm).subscribe({
      next: () => {
        this.loadTransactions();
        this.resetForm();
      },
      error: (error) => console.error('Error updating transaction:', error)
    });
  }

  deleteTransaction(id: number): void {
    if (confirm('Are you sure you want to delete this transaction?')) {
      this.transactionService.deleteTransaction(id).subscribe({
        next: () => this.loadTransactions(),
        error: (error) => console.error('Error deleting transaction:', error)
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.transactionForm = {
      type: 'income',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    };
    this.editMode = false;
    this.editingId = null;
  }

  get currentCategories(): string[] {
    return this.transactionForm.type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  getTotalIncome(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getNetProfit(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }
}
