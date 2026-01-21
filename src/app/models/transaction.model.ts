export interface Transaction {
  id: number;
  propertyId: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string; // ISO date string
  notes?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
}
