
import { Category, Transaction } from './types';

export const INITIAL_ALLOWANCE = 5000;

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#FF9F43',
  [Category.SHOPPING]: '#EE5253',
  [Category.TRANSPORT]: '#54A0FF',
  [Category.ENTERTAINMENT]: '#5F27CD',
  [Category.HABITS]: '#00D2D3',
  [Category.INCOME]: '#2ECC71',
  [Category.MISC]: '#8395A7',
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 5000,
    type: 'income',
    category: Category.INCOME,
    subCategory: 'Allowance',
    timestamp: Date.now() - 86400000 * 2,
    note: 'From Parents'
  },
  {
    id: '2',
    amount: 250,
    type: 'expense',
    category: Category.FOOD,
    subCategory: 'Dinner',
    timestamp: Date.now() - 86400000 * 1,
    note: 'Mess bill extra'
  },
  {
    id: '3',
    amount: 80,
    type: 'expense',
    category: Category.TRANSPORT,
    subCategory: 'Auto',
    timestamp: Date.now() - 3600000,
    note: 'College ride'
  }
];
