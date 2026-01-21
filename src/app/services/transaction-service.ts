import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction, TransactionSummary } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private apiUrl = 'http://localhost:3000/transactions';

  constructor(private http: HttpClient) { }

  /**
   * Fetch all transactions
   */
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  /**
   * Fetch transactions by property ID
   */
  getTransactionsByProperty(propertyId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}?propertyId=${propertyId}`);
  }

  /**
   * Fetch transactions by property and date range
   */
  getTransactionsByPropertyAndDate(
    propertyId: number | null, 
    startDate?: string, 
    endDate?: string
  ): Observable<Transaction[]> {
    let url = this.apiUrl;
    const params: string[] = [];
    
    if (propertyId !== null) {
      params.push(`propertyId=${propertyId}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    return this.http.get<Transaction[]>(url).pipe(
      map(transactions => {
        if (startDate && endDate) {
          return transactions.filter(t => 
            t.date >= startDate && t.date <= endDate
          );
        }
        return transactions;
      })
    );
  }

  /**
   * Get a single transaction by ID
   */
  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  /**
   * Add a new transaction
   */
  addTransaction(transaction: Omit<Transaction, 'id'>): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, transaction);
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(id: number, transaction: Partial<Transaction>): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/${id}`, transaction);
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Calculate transaction summary (total income, expense, net profit)
   */
  calculateSummary(transactions: Transaction[]): TransactionSummary {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netProfit = totalIncome - totalExpense;
    
    return { totalIncome, totalExpense, netProfit };
  }
}
