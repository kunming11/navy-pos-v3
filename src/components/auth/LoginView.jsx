import React, { useState } from 'react';
import { ShieldCheck, Delete, ArrowRight, Lock, WifiOff } from 'lucide-react';

export default function LoginView({ handleLoginCheck, isDarkMode }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumClick = (n) => {
    setError('');
    if (pin.length < 4) setPin(pin + n);
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const handleOK = () => {
    if (pin.length < 4) {
      setError('請輸入完整 4 位數 PIN 碼');
      return;
    }
    // 呼叫原本 App 的驗證邏輯
    handleLoginCheck(pin);
  };

  return (
    <div className={`relative flex h-full w-full flex-col items-center justify-center p-6 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white' 
        : 'bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 text-slate-800'
    }`}>
      
      {/* 頂部狀態列：強調海軍離線安全架構 */}
      <div className="absolute top-6 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-500 shadow-sm backdrop-blur-md">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
        <WifiOff size={14} />
        <span>狀態：離線安全模式 (Local Offline)</span>
      </div>

      {/* 核心卡片：現代毛玻璃設計 */}
      <div className={`w-full max-w-sm rounded-3xl p-8 shadow-2xl backdrop-blur-xl transition-all duration-300 ${
        isDarkMode 
          ? 'border border-slate-800/80 bg-slate-900/60 shadow-indigo-950/30' 
          : 'border border-white/80 bg-white/70 shadow-blue-900/10'
      }`}>
        
        {/* Logo 與標題區 */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 ring-4 ring-blue-500/20">
            <ShieldCheck size={44} className="animate-in zoom-in duration-500" />
          </div>
          <h1 className="text-2xl font-black tracking-wider">NAVY POS</h1>
          <p className="mt-1 text-xs font-medium tracking-widest text-slate-400">艦艇服務台智慧收銀系統</p>
        </div>

        {/* PIN 碼顯示窗 (優化盲打視覺) */}
        <div className="mb-6">
          <div className={`flex h-16 w-full items-center justify-center rounded-2xl border-2 tracking-[0.6em] transition-all duration-200 ${
            error 
              ? 'border-red-500/50 bg-red-500/10 text-red-500 animate-shake' 
              : isDarkMode
                ? 'border-slate-700/60 bg-slate-800/50 text-white shadow-inner'
                : 'border-slate-200 bg-slate-50/80 text-slate-800 shadow-inner'
          }`}>
            <span className="text-3xl font-bold font-mono">
              {pin ? pin.padEnd(4, '•') : '____'}
            </span>
          </div>
          {error && (
            <p className="mt-2 text-center text-xs font-bold text-red-500 animate-in fade-in">
              {error}
            </p>
          )}
        </div>

        {/* 數字鍵盤區：加大按鈕、回饋清晰 */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleNumClick(n)}
              className={`flex h-16 items-center justify-center rounded-2xl text-2xl font-bold shadow-sm transition-all duration-150 active:scale-90 ${
                isDarkMode 
                  ? 'bg-slate-800/80 hover:bg-slate-700/80 hover:shadow-md active:bg-slate-600' 
                  : 'bg-white hover:bg-slate-50 hover:shadow-md border border-slate-100 active:bg-slate-200'
              }`}
            >
              {n}
            </button>
          ))}
          
          {/* 清除與倒退按鈕 */}
          <button
            onClick={handleClear}
            onDoubleClick={handleClear}
            className="flex h-16 items-center justify-center rounded-2xl bg-red-500/10 text-lg font-bold text-red-500 transition active:scale-90 hover:bg-red-500/20"
            title="雙擊全清"
          >
            C
          </button>
          
          <button
            onClick={() => handleNumClick(0)}
            className={`flex h-16 items-center justify-center rounded-2xl text-2xl font-bold shadow-sm transition active:scale-90 ${
              isDarkMode ? 'bg-slate-800/80 hover:bg-slate-700/80' : 'bg-white hover:bg-slate-50 border border-slate-100'
            }`}
          >
            0
          </button>
          
          {/* 確認登入按鈕 */}
          <button
            onClick={handleOK}
            className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 transition active:scale-90 hover:from-blue-500 hover:to-indigo-500"
          >
            <ArrowRight size={28} />
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="text-[11px] text-slate-400">
            預設收銀員 PIN 碼: <code className="rounded bg-slate-500/10 px-1.5 py-0.5 font-mono font-bold">0000</code> / 管理員: <code className="rounded bg-slate-500/10 px-1.5 py-0.5 font-mono font-bold">1234</code>
          </span>
        </div>

      </div>
    </div>
  );
}
