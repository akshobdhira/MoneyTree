
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { ArrowLeft, Search, Filter, Heart, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onBack: () => void;
}

const HistoryScreen: React.FC<Props> = ({ transactions, onBack }) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'all' || t.type === filter;
    const matchesSearch = t.subCategory.toLowerCase().includes(search.toLowerCase()) || 
                          t.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-black tracking-tight">Activity Log</h1>
        </div>
        <div className="hidden md:flex gap-2">
           <div className="bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-500 uppercase tracking-widest">
             {transactions.length} Total Entries
           </div>
        </div>
      </header>

      {/* Search and Quick Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-black transition-all font-medium"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {['all', 'income', 'expense'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                filter === f 
                ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
                className="group flex items-center justify-between p-5 rounded-3xl bg-white border border-gray-100 shadow-sm hover:border-black transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/5 z-10"
                    style={{ backgroundColor: t.type === 'income' ? '#2ECC71' : CATEGORY_COLORS[t.category] }}
                  >
                    {t.type === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-sm">{t.subCategory}</p>
                      {t.isForFriends && <Heart size={12} fill="#3B82F6" className="text-blue-500" />}
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(t.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {t.category}
                    </p>
                  </div>
                </div>
                <div className="text-right z-10">
                  <p className={`font-black text-base ${t.type === 'expense' ? 'text-black' : 'text-green-600'}`}>
                    {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                  </p>
                  {t.isForFriends && <p className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">Shared Moment</p>}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-400 font-medium">No transactions found matching your search.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HistoryScreen;
