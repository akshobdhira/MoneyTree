
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Users, User, Heart, Info, Sparkles } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const AnalyticsScreen: React.FC<Props> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);

  // Category Distribution
  const categoryData = Object.values(Category).map(cat => {
    const total = expenses
      .filter(t => t.category === cat)
      .reduce((sum, t) => sum + t.amount, 0);
    return { name: cat, value: total };
  }).filter(d => d.value > 0);

  // Social vs Solo Data
  const socialSpent = expenses.filter(t => t.isForFriends).reduce((sum, t) => sum + t.amount, 0);
  const soloSpent = totalSpent - socialSpent;
  const socialPercentage = totalSpent > 0 ? Math.round((socialSpent / totalSpent) * 100) : 0;

  // 7-Day Trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = date.toLocaleDateString('en-IN', { weekday: 'short' });
    const total = expenses
      .filter(t => new Date(t.timestamp).toDateString() === date.toDateString())
      .reduce((sum, t) => sum + t.amount, 0);
    return { day: dayName, amount: total };
  });

  return (
    <div className="space-y-10 max-w-5xl pb-20">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Spending Trends</h1>
        <p className="text-gray-500 font-medium italic">"Dost bhi zaroori hain, paise bhi." — Balancing life and lens.</p>
      </header>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Category Distribution Chart */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Expense Mix</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', padding: '15px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Spent</p>
              <p className="text-3xl font-black">₹{totalSpent.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
            {categoryData.map((d) => (
              <div key={d.name} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[d.name as Category] }} />
                  <span className="text-[10px] font-black text-gray-800 uppercase truncate">{d.name}</span>
                </div>
                <p className="text-xs font-bold pl-4">₹{d.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* SOCIAL SPENDING ANALYSIS - REFINED TONE */}
        <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold">Social Investment</h3>
              <p className="text-xs text-gray-400 font-medium">Investing in core memories & shared moments</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-10">
            <div className="relative h-12 w-full bg-gray-100 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-center text-[10px] text-white font-black"
                style={{ width: `${socialPercentage}%` }}
              >
                {socialPercentage > 15 ? `${socialPercentage}% SOCIAL` : ''}
              </div>
              <div className="flex-1 flex items-center justify-end pr-4 text-[10px] text-gray-400 font-black">
                {100 - socialPercentage}% PERSONAL
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart size={14} fill="#3B82F6" className="text-blue-500" />
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Shared Moments</span>
                </div>
                <p className="text-2xl font-black text-blue-900">₹{socialSpent.toLocaleString()}</p>
              </div>
              <div className="p-5 rounded-3xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Personal Needs</span>
                </div>
                <p className="text-2xl font-black text-black">₹{soloSpent.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl flex items-start gap-3 border border-dashed border-gray-200">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                {socialPercentage > 45 
                  ? "Social life is booming! 🥂 Just a gentle nudge: keep an eye on the pace so you don't have to miss out on the party next week!" 
                  : "Great job on the balance! You're making memories while keeping your budget healthy. Stay winning! 🚀"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Momentum Chart */}
      <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold mb-8">7-Day Momentum</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} 
                dy={10}
              />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
              />
              <Bar 
                dataKey="amount" 
                fill="#000" 
                radius={[12, 12, 12, 12]} 
                barSize={32} 
                animationDuration={2000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6 font-medium uppercase tracking-widest">Est. Daily Burn: ₹{(totalSpent/30).toFixed(0)}</p>
      </div>

      {/* Summary Footer Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Weekly Average', value: `₹${(totalSpent / 4).toFixed(0)}`, color: 'text-black' },
          { label: 'Social Ratio', value: `${socialPercentage}%`, color: 'text-blue-500' },
          { label: 'Projected Surplus', value: `₹${(5000 - totalSpent > 0 ? 5000 - totalSpent : 0).toLocaleString()}`, color: 'text-green-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalyticsScreen;
