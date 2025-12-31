
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Plus, PieChart, Lightbulb, Wallet, Settings, History } from 'lucide-react';
import { AppTab, UserState, Transaction } from './types';
import { MOCK_TRANSACTIONS } from './constants';
import HomeScreen from './components/HomeScreen';
import AddExpenseScreen from './components/AddExpenseScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import InsightsScreen from './components/InsightsScreen';
import HistoryScreen from './components/HistoryScreen';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('money_tree_data');
    if (saved) return JSON.parse(saved);
    return {
      balance: 4370,
      transactions: MOCK_TRANSACTIONS,
      monthlyAllowance: 5000
    };
  });

  useEffect(() => {
    localStorage.setItem('money_tree_data', JSON.stringify(userState));
  }, [userState]);

  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  };

  const addTransaction = (t: Transaction) => {
    triggerHaptic();
    setUserState(prev => {
      const newBalance = t.type === 'income' ? prev.balance + t.amount : prev.balance - t.amount;
      return {
        ...prev,
        balance: newBalance,
        transactions: [t, ...prev.transactions]
      };
    });
    setShowAddModal(false);
    setActiveTab('home');
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: Home },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'insights', label: 'AI Insights', icon: Lightbulb },
    { id: 'history', label: 'Full Log', icon: History },
    { id: 'add', label: 'Manage Funds', icon: Wallet },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#FAFAFA] text-black overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 p-6 z-40">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white text-xs">MT</div>
            MoneyTree
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AppTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === item.id 
                ? 'bg-black text-white shadow-lg shadow-black/10' 
                : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-6 border-t border-gray-100">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-black hover:bg-gray-50 transition-all text-sm font-medium">
            <Settings size={18} />
            Settings
          </button>
          <div className="bg-gray-50 p-4 rounded-2xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Student Plan</p>
            <p className="text-xs font-bold">Standard Account</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative pt-safe pb-24 md:pb-6 md:pt-6 px-4 md:px-10">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <HomeScreen 
                  state={userState} 
                  onAddIncome={() => setShowAddModal(true)} 
                  onViewHistory={() => setActiveTab('history')} 
                />
              )}
              {activeTab === 'analytics' && <AnalyticsScreen transactions={userState.transactions} />}
              {activeTab === 'insights' && <InsightsScreen transactions={userState.transactions} balance={userState.balance} />}
              {activeTab === 'history' && (
                <HistoryScreen 
                  transactions={userState.transactions} 
                  onBack={() => setActiveTab('home')} 
                />
              )}
              {activeTab === 'add' && (
                <div className="p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm max-w-lg mx-auto mt-10">
                  <h2 className="text-2xl font-bold mb-4">Manage Allowance</h2>
                  <p className="text-gray-500 mb-8">Update your budget or record a one-time transfer from parents.</p>
                  <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full py-4 bg-black text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} /> Add Funds
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating Action Button (Universal) */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 active:scale-90 transition-all"
      >
        <Plus size={32} />
      </button>

      {/* Responsive Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full h-full md:h-auto md:max-w-xl bg-white md:rounded-[40px] shadow-2xl overflow-hidden pt-safe"
            >
              <AddExpenseScreen onAdd={addTransaction} onCancel={() => setShowAddModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 pb-safe pt-4 flex justify-between items-center z-40">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={22} />} label="Home" />
        <NavButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<PieChart size={22} />} label="Stats" />
        <div className="w-16 h-1 w-1 bg-transparent" /> {/* Spacer for Floating Action Button */}
        <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<History size={22} />} label="History" />
        <NavButton active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} icon={<Lightbulb size={22} />} label="Insights" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-black font-bold' : 'text-gray-400'}`}>
    {icon}
    <span className="text-[10px] uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
