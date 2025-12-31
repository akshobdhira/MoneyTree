
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, AlertTriangle, Info, TrendingUp, RefreshCcw } from 'lucide-react';
import { Transaction, AIInsight } from '../types';
import { generateInsights } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  balance: number;
}

const InsightsScreen: React.FC<Props> = ({ transactions, balance }) => {
  const [insights, setInsights] = useState<AIInsight[]>(() => {
    const saved = localStorage.getItem('moneytree_insights_cache');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(insights.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastAnalyzedHash = useRef<string>(localStorage.getItem('moneytree_last_hash') || '');

  // Simple hash to check if transactions changed
  const getTransactionsHash = () => {
    return transactions.length + '-' + (transactions[0]?.timestamp || 0) + '-' + balance;
  };

  useEffect(() => {
    const fetchInsights = async () => {
      const currentHash = getTransactionsHash();
      
      // If data hasn't changed and we have cache, don't hit the API
      if (currentHash === lastAnalyzedHash.current && insights.length > 0) {
        setLoading(false);
        return;
      }

      setIsRefreshing(true);
      try {
        const data = await generateInsights(transactions, balance);
        setInsights(data);
        localStorage.setItem('moneytree_insights_cache', JSON.stringify(data));
        localStorage.setItem('moneytree_last_hash', currentHash);
        lastAnalyzedHash.current = currentHash;
      } catch (e) {
        console.error('Insight generation failed:', e);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

    fetchInsights();
  }, [transactions, balance]);

  return (
    <div className="p-6 pb-24">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Smart Insights</h1>
          <p className="text-gray-500 font-medium">AI analysis of your habits</p>
        </div>
        {isRefreshing && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest"
          >
            <RefreshCcw size={12} className="animate-spin" />
            Syncing
          </motion.div>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles size={40} className="text-black/10" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-bold text-gray-800">Calculating patterns...</p>
            <p className="text-xs text-gray-400 mt-1 italic font-medium">Almost there, friend!</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {insights.map((insight, idx) => (
              <motion.div
                key={`${insight.title}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 rounded-[32px] border border-gray-100 bg-white shadow-sm flex flex-col gap-3 relative overflow-hidden group hover:border-black/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  {insight.type === 'warning' && <AlertTriangle size={18} className="text-orange-500" />}
                  {insight.type === 'success' && <TrendingUp size={18} className="text-green-500" />}
                  {insight.type === 'info' && <Info size={18} className="text-blue-500" />}
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    insight.type === 'warning' ? 'text-orange-500' : 
                    insight.type === 'success' ? 'text-green-500' : 'text-blue-500'
                  }`}>
                    {insight.type}
                  </span>
                </div>
                <h3 className="text-lg font-black leading-tight tracking-tight">{insight.title}</h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed">{insight.message}</p>
                
                <button className="mt-2 text-[10px] font-black flex items-center gap-1 group/btn uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
                  Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-black text-white p-8 rounded-[40px] text-center shadow-2xl shadow-black/20"
          >
            <h3 className="text-xl font-bold mb-2">Saving Goal</h3>
            <p className="text-white/60 text-sm mb-6">You're ₹1,200 away from your Monthly Saving Target of ₹2,500.</p>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-white" 
              />
            </div>
            <button className="bg-white text-black py-4 px-10 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
              Adjust Goal
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default InsightsScreen;
