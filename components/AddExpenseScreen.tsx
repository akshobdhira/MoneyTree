
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Check, Sparkles, Plus, ArrowRight, User, Users, Heart, Coffee, Utensils, Car, ShoppingBag, Music, Flame, HelpCircle, Cigarette } from 'lucide-react';
import { Category, Transaction } from '../types';
import { categorizeExpense, processBillImage } from '../services/geminiService';

interface Props {
  onAdd: (t: Transaction) => void;
  onCancel: () => void;
}

const QUICK_OPTIONS = [
  { label: 'Lunch / Dinner', icon: <Utensils size={16} />, category: 'Food' },
  { label: 'Chai / Coffee', icon: <Coffee size={16} />, category: 'Food' },
  { label: 'Auto / Metro', icon: <Car size={16} />, category: 'Transport' },
  { label: 'Clothes / Shoes', icon: <ShoppingBag size={16} />, category: 'Shopping' },
  { label: 'Smoke / Vape', icon: <Cigarette size={16} />, category: 'Habits' },
  { label: 'Movie / Gaming', icon: <Music size={16} />, category: 'Entertainment' },
  { label: 'Daily Habits', icon: <Flame size={16} />, category: 'Habits' },
  { label: 'Something else', icon: <HelpCircle size={16} />, category: 'Misc' },
];

const AddExpenseScreen: React.FC<Props> = ({ onAdd, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [userContext, setUserContext] = useState('');
  const [step, setStep] = useState<'amount' | 'type' | 'context' | 'incomeSource' | 'ai' | 'confirm'>('amount');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [isForFriends, setIsForFriends] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{ category: Category; subCategory: string; question: string } | null>(null);
  const [subCategoryInput, setSubCategoryInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAmountSubmit = () => {
    if (!amount || isNaN(Number(amount))) return;
    setStep('type'); 
  };

  const handleTypeSelect = (selectedType: 'income' | 'expense') => {
    setType(selectedType);
    if (selectedType === 'income') {
      setStep('incomeSource');
    } else {
      setStep('context');
    }
  };

  const handleQuickOptionSelect = async (option: string) => {
    setUserContext(option);
    await performAiAnalysis(option);
  };

  const handleContextSubmit = async () => {
    await performAiAnalysis(userContext);
  };

  const performAiAnalysis = async (context: string) => {
    setStep('ai');
    setAiLoading(true);
    try {
      const result = await categorizeExpense(Number(amount), context);
      setAiResult(result);
      setSubCategoryInput(result.subCategory);
      setStep('confirm');
    } catch (e) {
      setAiResult({ category: Category.MISC, subCategory: 'General', question: 'Adding this to the log. Sounds good?' });
      setStep('confirm');
    } finally {
      setAiLoading(false);
    }
  };

  const handleIncomeFinalize = (source: 'parents' | 'friends' | 'other') => {
    let subCat = 'Extra Cash';
    let note = '';
    
    if (source === 'parents') {
      subCat = 'Allowance';
      note = 'From Parents';
    } else if (source === 'friends') {
      subCat = 'Settled by Friend';
      note = 'Money returned';
    }

    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      amount: Number(amount),
      type: 'income',
      category: Category.INCOME,
      subCategory: subCat,
      timestamp: Date.now(),
      note: note
    });
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAiLoading(true);
    setStep('ai');
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const result = await processBillImage(base64);
        setAmount(result.amount.toString());
        setAiResult({ category: result.category, subCategory: result.subCategory, question: "Found a bill for " + result.subCategory + ". Correct?" });
        setSubCategoryInput(result.subCategory);
        setStep('confirm');
      } catch (error) { console.error(error); } 
      finally { setAiLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full md:h-auto min-h-[450px]">
      <div className="flex justify-between items-center p-6 md:p-8 border-b border-gray-50">
        <h2 className="text-xl font-black tracking-tight">Record Transaction</h2>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 p-6 md:p-10 flex items-center justify-center min-h-[400px]">
        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div key="amt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full text-center">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">How much?</p>
              <div className="flex items-center justify-center gap-2 mb-12">
                <span className="text-4xl font-light text-gray-300">₹</span>
                <input 
                  autoFocus type="number" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-7xl font-black bg-transparent outline-none w-2/3 text-center tracking-tighter"
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 max-w-sm mx-auto">
                <button onClick={handleAmountSubmit} className="flex-1 bg-black text-white py-5 rounded-[24px] font-bold shadow-xl shadow-black/10 flex items-center justify-center gap-2 transition-all active:scale-95">
                  Next <ArrowRight size={18} />
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-black py-5 rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Camera size={18} /> Scan Bill
                </button>
                <input type="file" hidden ref={fileInputRef} onChange={handleScan} accept="image/*" />
              </div>
            </motion.div>
          )}

          {step === 'type' && (
            <motion.div key="type" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm flex flex-col gap-4">
              <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-2">₹{amount} - What kind of entry?</p>
              <button onClick={() => handleTypeSelect('expense')} className="w-full p-8 rounded-[32px] bg-black text-white flex items-center justify-between group transition-all active:scale-95">
                <span className="text-2xl font-black">Expense</span>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"><ArrowRight /></div>
              </button>
              <button onClick={() => handleTypeSelect('income')} className="w-full p-8 rounded-[32px] bg-gray-50 border border-gray-100 text-black flex items-center justify-between group transition-all active:scale-95">
                <span className="text-2xl font-black">Income</span>
                <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center"><Plus /></div>
              </button>
            </motion.div>
          )}

          {step === 'context' && (
            <motion.div key="context" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full text-center max-w-md">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">₹{amount} - What was this for?</p>
              <input 
                autoFocus type="text" value={userContext}
                onChange={(e) => setUserContext(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleContextSubmit()}
                className="text-3xl font-bold bg-transparent outline-none w-full text-center tracking-tight mb-8 border-b-2 border-transparent focus:border-black transition-all"
                placeholder="Type here..."
              />
              
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => handleQuickOptionSelect(opt.label)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-100 rounded-full text-xs font-bold hover:border-black hover:bg-gray-50 transition-all shadow-sm active:scale-95"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleContextSubmit} 
                disabled={!userContext.trim()}
                className={`w-full py-5 rounded-[24px] font-bold shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  userContext.trim() 
                  ? 'bg-black text-white shadow-black/10' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                Continue <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 'incomeSource' && (
            <motion.div key="source" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm flex flex-col gap-4">
              <p className="text-center text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-4">₹{amount} Income - From where?</p>
              <button onClick={() => handleIncomeFinalize('parents')} className="w-full p-6 rounded-[24px] bg-white border border-gray-200 hover:border-black hover:shadow-lg transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-100"><User size={20} /></div>
                <div className="text-left">
                  <p className="font-bold">Parents</p>
                  <p className="text-xs text-gray-400 font-medium">Monthly allowance</p>
                </div>
              </button>
              <button onClick={() => handleIncomeFinalize('friends')} className="w-full p-6 rounded-[24px] bg-white border border-gray-200 hover:border-black hover:shadow-lg transition-all flex items-center gap-4 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-100"><Users size={20} /></div>
                <div className="text-left">
                  <p className="font-bold">Friends</p>
                  <p className="text-xs text-gray-400 font-medium">Settled split</p>
                </div>
              </button>
              <button onClick={() => handleIncomeFinalize('other')} className="text-center py-4 text-gray-400 text-xs font-bold tracking-widest uppercase hover:text-black transition-colors">Other Source</button>
            </motion.div>
          )}

          {step === 'ai' && (
            <motion.div key="ai" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-8 text-center">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-24 h-24 rounded-full border-4 border-black border-t-transparent flex items-center justify-center">
                <Sparkles className="text-black" size={32} />
              </motion.div>
              <div>
                <p className="text-lg font-bold tracking-tight">AI Thinking...</p>
                <p className="text-sm text-gray-400 mt-1 font-medium italic">Finding the best category for you</p>
              </div>
            </motion.div>
          )}

          {step === 'confirm' && aiResult && (
            <motion.div key="conf" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
              <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 mb-6">
                <div className="flex items-center gap-2 mb-6 text-[10px] font-bold text-purple-600 uppercase tracking-widest">
                  <Sparkles size={14} /> Intelligence Check
                </div>
                
                <div className="mb-8">
                  <div className="inline-block px-4 py-1.5 bg-white rounded-full text-xs font-bold shadow-sm border border-gray-100 mb-4">
                    {aiResult.category}
                  </div>
                  <h3 className="text-3xl font-black mb-3 tracking-tight">₹{amount}</h3>
                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 relative">
                    <p className="text-sm text-gray-700 font-medium italic leading-relaxed">
                      "{aiResult.question}"
                    </p>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-l border-b border-gray-100 rotate-45" />
                  </div>
                </div>
                
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Description</p>
                   <input 
                    type="text" value={subCategoryInput}
                    onChange={(e) => setSubCategoryInput(e.target.value)}
                    placeholder="e.g. Starbucks, Bus fare..."
                    className="w-full p-6 rounded-2xl bg-white border border-gray-100 outline-none focus:border-black transition-all text-xl font-bold mb-2"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 mt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isForFriends ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                      <Heart size={18} fill={isForFriends ? "currentColor" : "none"} />
                    </div>
                    <span className="text-sm font-bold">Shared Moment?</span>
                  </div>
                  <button 
                    onClick={() => setIsForFriends(!isForFriends)}
                    className={`w-12 h-6 rounded-full transition-all relative ${isForFriends ? 'bg-black' : 'bg-gray-200'}`}
                  >
                    <motion.div 
                      animate={{ x: isForFriends ? 26 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => onAdd({
                  id: Math.random().toString(36).substr(2, 9),
                  amount: Number(amount),
                  type: 'expense',
                  category: aiResult.category,
                  subCategory: subCategoryInput || aiResult.subCategory,
                  timestamp: Date.now(),
                  isForFriends: isForFriends,
                  note: isForFriends ? 'Friend social spend' : ''
                })} className="bg-black text-white p-5 rounded-[24px] font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all">
                  <Check size={20} /> Confirm
                </button>
                <button onClick={() => setStep('amount')} className="bg-gray-100 text-black p-5 rounded-[24px] font-bold active:scale-95 transition-all">Restart</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AddExpenseScreen;
