
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, AlertTriangle, Info, TrendingUp } from 'lucide-react';
import { Transaction, AIInsight } from '../types';
import { generateInsights } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
  balance: number;
}

const InsightsScreen: React.FC<Props> = ({ transactions, balance }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await generateInsights(transactions, balance);
        setInsights(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [transactions, balance]);

  return (
    <div className="p-6 pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Smart Insights</h1>
        <p className="text-gray-500 font-medium">AI analysis of your habits</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Sparkles size={40} className="text-gray-200" />
          </motion.div>
          <p className="text-sm font-medium text-gray-400">Deep scanning your spends...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-6 rounded-[32px] border border-gray-100 bg-white shadow-sm flex flex-col gap-3 relative overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-2">
                {insight.type === 'warning' && <AlertTriangle size={18} className="text-orange-500" />}
                {insight.type === 'success' && <TrendingUp size={18} className="text-green-500" />}
                {insight.type === 'info' && <Info size={18} className="text-blue-500" />}
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  insight.type === 'warning' ? 'text-orange-500' : 
                  insight.type === 'success' ? 'text-green-500' : 'text-blue-500'
                }`}>
                  {insight.type}
                </span>
              </div>
              <h3 className="text-lg font-bold leading-tight">{insight.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{insight.message}</p>
              
              <button className="mt-2 text-xs font-bold flex items-center gap-1 group">
                LEARN MORE <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}

          <div className="bg-black text-white p-8 rounded-[40px] text-center">
            <h3 className="text-xl font-bold mb-2">Saving Goal</h3>
            <p className="text-gray-400 text-sm mb-6">You're ₹1,200 away from your Monthly Saving Target of ₹2,500.</p>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-8">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-white" 
              />
            </div>
            <button className="bg-white text-black py-4 px-8 rounded-full font-bold text-sm">
              Adjust Goal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsScreen;
