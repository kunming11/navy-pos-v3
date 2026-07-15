import React, { useState } from 'react';
import { usePosStore } from '../../store/usePosStore';
import { 
  ShoppingCart, Search, X, Plus, Minus, Trash2, 
  User, ArrowRight, AlertCircle, LayoutGrid, List, Tag 
} from 'lucide-react';

export default function POSView({ setView, isDarkMode, layoutMode = 'grid' }) {
  // 從 Zustand 大腦提取狀態與方法 (無需再依賴繁瑣的 props 傳遞)
  const products = usePosStore((state) => state.products);
  const categories = usePosStore((state) => state.categories);
  const cart = usePosStore((state) => state.cart);
  const addToCart = usePosStore((state) => state.addToCart);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  const activeCustomer = usePosStore((state) => state.activeCustomer);
  const updateCartQuantity = usePosStore((state) => state.updateCartQuantity);

  // 內部 UI 狀態
  const [filterCategory, setFilterCategory] = useState('所有商品');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [localLayout, setLocalLayout] = useState(layoutMode);

  // 購物車計算
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // 商品篩選與排序邏輯 (只顯示已上架商品，並支援名稱與條碼搜尋)
  const filteredProducts = products.filter((p) => {
    if (p.isDiscontinued) return false;
    const matchCategory = filterCategory === '所有商品' || p.category === filterCategory;
    const matchSearch = searchKeyword 
      ? (p.name.toLowerCase().includes(searchKeyword.toLowerCase())) 
      : true;
    return matchCategory && matchSearch;
  });

  // 取得唯一分類清單
  const uniqueCategories = Array.from(new Set(products.map(p => p.category)));

  // 更新購物車數量輔助函式
  const updateCartQty = (id, delta) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    if (item.qty + delta <= 0) {
      removeFromCart(id);
    } else {
      updateCartQuantity(id, item.qty + delta);
    }
  };

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden select-none md:flex-row transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* ================= 左側/主要區域：商品點選主控台 ================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* 1. 頂部控制列 (搜尋、客戶鎖定狀態、佈局切換) */}
        <header className={`flex items-center justify-between border-b px-4 py-3 shrink-0 backdrop-blur-md ${
          isDarkMode ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'
        }`}>
          {/* 搜尋框 (支援條碼槍快速掃入) */}
          <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 w-full max-w-xs transition-all ${
            isDarkMode ? 'bg-slate-800/80 text-white focus-within:ring-2 focus-within:ring-blue-500' : 'bg-slate-100 text-slate-800 focus-within:ring-2 focus-within:ring-blue-500/50'
          }`}>
            <Search size={18} className="text-slate-400 shrink-0" />
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="掃描條碼或搜尋商品..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword('')} className="text-slate-400 hover:text-slate-200">
                <X size={16} />
              </button>
            )}
          </div>

          {/* 右側：鎖定客戶標籤與切換按鈕 */}
          <div className="flex items-center gap-3 ml-2">
            <div className={`hidden sm:flex items-center gap-2 rounded-2xl px-3 py-1.5 border ${
              isDarkMode ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700'
            }`}>
              <User size={16} />
              <span className="text-xs text-slate-400">當前客戶:</span>
              <span className="text-sm font-bold truncate max-w-[100px]">{activeCustomer?.name || '未指定'}</span>
            </div>
            
            <button 
              onClick={() => setView && setView('customer_select')}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-md active:scale-95 transition hover:from-blue-500 hover:to-indigo-500"
            >
              換人
            </button>

            {/* 網格/清單 切換按鈕 */}
            <div className={`hidden sm:flex rounded-xl p-1 border ${isDarkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-slate-200'}`}>
              <button 
                onClick={() => setLocalLayout('grid')}
                className={`p-1.5 rounded-lg transition ${localLayout === 'grid' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setLocalLayout('list')}
                className={`p-1.5 rounded-lg transition ${localLayout === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* 2. 觸控滑動種類標籤 (Horizontal Category Pills) */}
        <div className={`flex items-center gap-2 overflow-x-auto px-4 py-3 shrink-0 border-b scrollbar-hide ${
          isDarkMode ? 'border-slate-800/60 bg-slate-900/40' : 'border-slate-200/60 bg-white/50'
        }`}>
          <button
            onClick={() => setFilterCategory('所有商品')}
            className={`rounded-2xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              filterCategory === '所有商品'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-200 shadow-sm border border-slate-200/60'
            }`}
          >
            🔥 所有商品
          </button>
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-95 flex items-center gap-1.5 ${
                filterCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-200 shadow-sm border border-slate-200/60'
              }`}
            >
              <Tag size={12} />
              {cat}
            </button>
          ))}
        </div>

        {/* 3. 商品展演矩陣 / 列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-slate-400">
              <AlertCircle size={48} className="mb-2 opacity-30" />
              <p className="text-sm font-medium">找不到相符的商品或條碼</p>
            </div>
          ) : localLayout === 'grid' ? (
            
            /* 【網格模式 Grid】適合 iPad 平板大按鈕觸控 */
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 pb-20 md:pb-4">
              {filteredProducts.map((p) => {
                const inCart = cart.find((c) => c.id === p.id);
                const isOutOfStock = p.trackStock && p.stock <= 0;
                const isLowStock = p.trackStock && p.stock > 0 && p.stock <= 10;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`relative flex flex-col justify-between overflow-hidden rounded-3xl p-4 text-left transition-all duration-200 active:scale-95 ${
                      isOutOfStock
                        ? isDarkMode ? 'bg-slate-900/40 opacity-40 cursor-not-allowed border border-slate-800' : 'bg-slate-200/60 opacity-50 cursor-not-allowed border border-slate-300'
                        : isDarkMode
                          ? 'bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10'
                          : 'bg-white hover:bg-blue-50/30 border border-slate-200/80 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5'
                    }`}
                  >
                    {/* 購物車已選數量標籤 (徽章動畫) */}
                    {inCart && (
                      <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-black text-white shadow-md">
                        {inCart.qty}
                      </div>
                    )}

                    {/* 商品名稱與分類 */}
                    <div>
                      <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold mb-1.5 ${
                        isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.category}
                      </span>
                      <h3 className="font-bold text-base leading-snug line-clamp-2">{p.name}</h3>
                    </div>

                    {/* 價格與庫存條 */}
                    <div className="mt-4 pt-2 border-t border-slate-500/10">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xl font-black text-blue-500">${p.price}</span>
                        <span className={`text-[11px] font-bold ${
                          isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-400' : 'text-slate-400'
                        }`}>
                          {p.trackStock ? `剩 ${p.stock}` : '∞'}
                        </span>
                      </div>

                      {/* 視覺化庫存進度條 (低庫存變橘，無庫存變紅) */}
                      {p.trackStock && (
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-500/20">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              isOutOfStock ? 'bg-red-500' : isLowStock ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* 缺貨遮罩 */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] font-black text-white tracking-widest">
                        補貨中
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            
            /* 【清單模式 List】適合快速掃描條碼或對帳 */
            <div className="flex flex-col gap-2 pb-20 md:pb-4">
              {filteredProducts.map((p) => {
                const inCart = cart.find((c) => c.id === p.id);
                const isOutOfStock = p.trackStock && p.stock <= 0;

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(p)}
                    className={`flex items-center justify-between rounded-2xl p-3.5 border transition-all active:scale-[0.99] ${
                      isOutOfStock
                        ? 'opacity-40 cursor-not-allowed border-slate-500/20'
                        : isDarkMode
                          ? 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-blue-500'
                          : 'bg-white hover:bg-blue-50/20 border-slate-200 hover:border-blue-500 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 font-bold text-sm">
                        {p.category[0]}
                      </div>
                      <div>
                        <div className="font-bold text-base flex items-center gap-2">
                          {p.name}
                          {inCart && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">已選 x{inCart.qty}</span>}
                        </div>
                        <div className="text-xs text-slate-400">庫存: {p.trackStock ? p.stock : '∞'}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-black text-blue-500">${p.price}</div>
                        <div className="text-[11px] text-slate-400">
                          庫存: {p.trackStock ? p.stock : '∞'}
                        </div>
                      </div>
                      <Plus size={20} className="text-blue-500 mr-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* ================= 右側 (iPad/桌面)：交易明細與收銀側邊欄 ================= */}
      <div className={`hidden md:flex w-96 flex-col border-l shadow-2xl shrink-0 z-20 ${
        isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
      }`}>
        {/* 側邊欄標題 */}
        <div className={`flex items-center justify-between border-b px-6 py-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex items-center gap-2 font-bold text-lg">
            <ShoppingCart className="text-blue-500" />
            <span>當前帳單明細</span>
          </div>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-bold text-blue-500">
            {cartCount} 件
          </span>
        </div>

        {/* 購物車品項列表 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-500/20 p-6 text-center text-slate-400">
              <ShoppingCart size={40} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">請點選左側商品加入購物車</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={`flex items-center justify-between rounded-2xl p-3.5 border ${
                isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex-1 min-w-0 mr-2">
                  <h4 className="font-bold text-sm truncate">{item.name}</h4>
                  <div className="text-xs font-semibold text-blue-500">${item.price}</div>
                </div>

                {/* 數量控制按鈕組 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => updateCartQty(item.id, -1)}
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition active:scale-90 ${
                      isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    }`}
                  >
                    <Minus size={14} />
                  </button>
                  
                  <span className="w-6 text-center font-bold font-mono text-sm">{item.qty}</span>
                  
                  <button
                    onClick={() => updateCartQty(item.id, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 transition active:scale-90 hover:bg-blue-500/20"
                  >
                    <Plus size={14} />
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition active:scale-90 hover:bg-red-500/20 ml-1"
                    title="移除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 底部總價與結帳按鈕 */}
        <div className={`border-t p-6 ${isDarkMode ? 'border-slate-800 bg-slate-900/90' : 'border-slate-100 bg-slate-50/80'}`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400">應付總計 (Total)</span>
            <span className="text-3xl font-black text-blue-500 font-mono">${cartTotal}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => setView && setView('payment')}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold shadow-lg transition active:scale-98 ${
              cart.length === 0
                ? 'bg-slate-500/20 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500'
            }`}
          >
            <span>前往結帳</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>


      {/* ================= 底部 Summary 列 (iPhone/手機版專用) ================= */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 border-t p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.15)] z-40 backdrop-blur-lg ${
        isDarkMode ? 'border-slate-800 bg-slate-900/95' : 'border-slate-200 bg-white/95'
      }`}>
        <div className="flex items-center justify-between">
          {/* 左點擊查看購物車詳情 */}
          <button 
            onClick={() => setShowMobileCart(!showMobileCart)}
            className="flex items-center gap-3 text-left"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 font-mono text-xs font-black text-white shadow">
                  {cartCount}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">應付總計</div>
              <div className="text-2xl font-black text-blue-500 font-mono">${cartTotal}</div>
            </div>
          </button>

          {/* 右：去結帳按鈕 */}
          <button
            disabled={cart.length === 0}
            onClick={() => setView && setView('payment')}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold shadow-lg transition active:scale-95 ${
              cart.length === 0
                ? 'bg-slate-500/20 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/25'
            }`}
          >
            <span>去結帳</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* ================= 手機版：購物車上滑抽屜 (Mobile Drawer) ================= */}
      {showMobileCart && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs">
          <div className={`flex flex-col max-h-[80%] rounded-t-[2.5rem] p-6 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-500/20">
              <div className="flex items-center gap-2 font-bold text-lg">
                <ShoppingCart className="text-blue-500" />
                <span>購物車明細 ({cartCount} 件)</span>
              </div>
              <button 
                onClick={() => setShowMobileCart(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-500/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 max-h-[40vh] pb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl p-3 border border-slate-500/20">
                  <div className="font-bold text-sm">{item.name} (${item.price})</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateCartQty(item.id, -1)} className="h-8 w-8 rounded-lg bg-slate-500/20 font-bold">-</button>
                    <span className="w-6 text-center font-mono font-bold">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.id, 1)} className="h-8 w-8 rounded-lg bg-blue-500/20 text-blue-500 font-bold">+</button>
                    <button onClick={() => removeFromCart(item.id)} className="h-8 w-8 rounded-lg bg-red-500/20 text-red-500 ml-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setShowMobileCart(false); setView && setView('payment'); }}
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 font-bold text-white shadow-lg shadow-blue-500/30 mt-4"
            >
              確認帳單，前往結帳 (${cartTotal})
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
