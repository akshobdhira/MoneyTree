
import React from 'react';
import { motion } from 'framer-motion';
import { UserState, Transaction, Category } from '../types';
import { ArrowUpRight, ArrowDownLeft, Calendar, Filter, Heart } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  state: UserState;
  onAddIncome: () => void;
  onViewHistory: () => void;
}

const HomeScreen: React.FC<Props> = ({ state, onAddIncome, onViewHistory }) => {
  const todayTransactions = state.transactions.filter(t => 
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  );
  const todaySpent = todayTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-gray-500 font-medium mb-1">Welcome back,</p>
          <h1 className="text-4xl font-black tracking-tight">Financial Overview</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            <Calendar size={14} /> This Month
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            <Filter size={14} /> Filters
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-black text-white rounded-[40px] p-8 md:p-10 relative overflow-hidden shadow-2xl shadow-black/10">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <p className="text-white/60 font-medium mb-2">Available Balance</p>
          <h2 className="text-5xl md:text-6xl font-black mb-10 tracking-tighter">₹{state.balance.toLocaleString()}</h2>
          
          <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly Budget</p>
              <p className="text-xl font-bold">₹{state.monthlyAllowance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Spent Today</p>
              <p className="text-xl font-bold">₹{todaySpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Action Quick Summary */}
        <div className="bg-white border border-gray-100 rounded-[40px] p-8 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-lg font-bold mb-6">Quick Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Income</p>
                    <p className="text-gray-400 text-[10px]">Monthly Total</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">+₹{state.monthlyAllowance}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold">Outcome</p>
                    <p className="text-gray-400 text-[10px]">Today's Total</p>
                  </div>
                </div>
                <p className="font-bold text-red-600">-₹{todaySpent}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onViewHistory}
            className="w-full mt-8 py-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-xs font-bold transition-all active:scale-95"
          >
            Full History
          </button>
        </div>
      </div>

      {/* Transactions Grid */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tight">Activity Log</h2>
          <button 
            onClick={onViewHistory}
            className="text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            See all transactions
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.transactions.slice(0, 10).map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={onViewHistory}
              className="group flex items-center justify-between p-5 rounded-3xl bg-white border border-gray-50 shadow-sm hover:border-gray-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-black/5 z-10"
                  style={{ backgroundColor: t.type === 'income' ? '#2ECC71' : CATEGORY_COLORS[t.category] }}
                >
                  {t.category === Category.INCOME ? '+' : t.category[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm group-hover:underline underline-offset-4">{t.subCategory}</p>
                    {t.isForFriends && <Heart size={12} fill="#3B82F6" className="text-blue-500" />}
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {t.category === Category.INCOME ? 'Allowance & Funds' : t.category}
                  </p>
                </div>
              </div>
              <div className="text-right z-10">
                <p className={`font-black text-base ${t.type === 'expense' ? 'text-black' : 'text-green-600'}`}>
                  {t.type === 'expense' ? '-' : '+'}₹{t.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase">
                  {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              
              {/* Subtle background indicator for social spending */}
              {t.isForFriends && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/20 rounded-full blur-2xl -mr-8 -mt-8" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
