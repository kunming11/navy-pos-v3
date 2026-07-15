import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/usePosStore';

export default function PosView() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pin, setPin] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // 從 Store 提取狀態與方法
  const currentUser = usePosStore((state) => state.currentUser);
  const activeCustomer = usePosStore((state) => state.activeCustomer);
  const cart = usePosStore((state) => state.cart);
  const products = usePosStore((state) => state.products);
  const customers = usePosStore((state) => state.customers);
  const categories = usePosStore((state) => state.categories);

  const login = usePosStore((state) => state.login);
  const logout = usePosStore((state) => state.logout);
  const selectCustomer = usePosStore((state) => state.selectCustomer);
  const addToCart = usePosStore((state) => state.addToCart);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  const updateCartQuantity = usePosStore((state) => state.updateCartQuantity);
  const processPayment = usePosStore((state) => state.processPayment);
  const clearCart = usePosStore((state) => state.clearCart);

  // 監聽登入狀態
  useEffect(() => {
    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // 監聽客戶選擇
  useEffect(() => {
    setSelectedCustomer(activeCustomer?.id);
  }, [activeCustomer]);

  // 計算購物車總額
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  // 登入流程
  const handleLogin = () => {
    if (pin.length < 4) {
      alert('PIN 碼至少 4 位');
      return;
    }
    const result = login(pin);
    if (!result) {
      alert('PIN 碼錯誤');
      setPin('');
    }
  };

  // 選擇客戶
  const handleSelectCustomer = (customerId) => {
    selectCustomer(customerId);
  };

  // 結帳
  const handleCheckout = (method) => {
    const result = processPayment(method);
    if (result) {
      alert(`✅ 結帳成功！\n交易單號：${result.order_id}\n應付金額：$${result.total}`);
    } else {
      alert('❌ 結帳失敗，請檢查購物車是否為空');
    }
  };

  // 未登入畫面
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-slate-800">Navy POS</h1>
          <p className="mb-8 text-center text-slate-500">員工登入</p>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="輸入 PIN 碼"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full rounded-lg border-2 border-slate-200 px-4 py-3 text-center text-2xl font-bold tracking-widest placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
            
            <button
              onClick={handleLogin}
              className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white transition hover:bg-blue-700 active:scale-95"
            >
              登入
            </button>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-6">
            <p className="mb-3 text-center text-xs text-slate-500">測試帳號：</p>
            <div className="space-y-2 text-xs text-slate-600">
              <p>👨‍💼 管理員: PIN <code className="rounded bg-slate-100 px-2 py-1">1234</code></p>
              <p>💳 收銀員A: PIN <code className="rounded bg-slate-100 px-2 py-1">0001</code></p>
              <p>💳 收銀員B: PIN <code className="rounded bg-slate-100 px-2 py-1">0002</code></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 客戶選擇畫面
  if (!activeCustomer) {
    return (
      <div className="flex h-screen w-full flex-col bg-slate-100">
        <div className="border-b bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-800">選擇客戶</h1>
            <button
              onClick={() => logout()}
              className="rounded-lg bg-red-600 px-4 py-2 text-white font-bold transition hover:bg-red-700"
            >
              登出
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">操作員: {currentUser?.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {customers.map((customer) => (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id)}
                className="rounded-2xl bg-white p-6 text-left shadow-md transition hover:shadow-lg active:scale-95"
              >
                <div className="text-xl font-bold text-slate-800">{customer.name}</div>
                <div className="mt-2 text-sm text-slate-600">📱 {customer.phone}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-500">欠款餘額</span>
                  <span className={`text-lg font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${customer.balance}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 主要收銀畫面
  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 font-sans select-none md:flex-row">
      {/* 左側：商品點選矩陣 */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">點餐收銀主控台</h1>
            <p className="mt-1 text-sm text-slate-600">操作員: {currentUser?.name}</p>
          </div>
          <button
            onClick={() => logout()}
            className="rounded-lg bg-red-600 px-4 py-2 text-white font-bold transition hover:bg-red-700"
          >
            登出
          </button>
        </header>

        {/* 分類標籤 */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-blue-100"
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* 商品網格 */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <button
              key={product.id}
              disabled={product.isDiscontinued}
              onClick={() => addToCart(product)}
              className={`flex min-h-[120px] flex-col justify-between rounded-2xl p-4 text-left shadow-sm transition active:scale-95 ${
                product.isDiscontinued
                  ? 'cursor-not-allowed bg-slate-200 opacity-50'
                  : 'bg-white hover:border-2 hover:border-blue-500 hover:shadow-md active:bg-blue-50'
              }`}
            >
              <div className="text-lg font-bold text-slate-700">{product.name}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xl font-black text-blue-600">${product.price}</span>
                {product.isDiscontinued && (
                  <span className="rounded-md bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                    已停售
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 右側：購物車與結帳側邊欄 */}
      <div className="flex w-full flex-col border-t bg-white p-4 shadow-xl md:w-96 md:border-l md:border-t-0 md:p-6">
        <div className="mb-4 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800">當前交易</h2>
          <p className="mt-1 text-sm text-slate-600">客戶: {activeCustomer?.name}</p>
        </div>

        {/* 購物車品項列表 */}
        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-400">
              請點擊左側商品加入帳單
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">{item.name}</div>
                    <div className="text-sm font-semibold text-slate-500">${item.price} x {item.qty}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.qty - 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl font-black text-slate-600 transition active:scale-90 active:bg-slate-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-slate-800">{item.qty}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.qty + 1)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100 text-xl font-black text-blue-600 transition active:scale-90 active:bg-blue-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部總額與結帳按鈕 */}
        <div className="border-t border-slate-100 pt-4">
          <div className="mb-4 flex items-center justify-between font-bold text-slate-800">
            <span className="text-lg">應付總額</span>
            <span className="text-3xl font-black text-blue-600">${cartTotal}</span>
          </div>

          {/* 支付方式按鈕 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCheckout('cash')}
              disabled={cart.length === 0}
              className={`min-h-[48px] rounded-lg font-bold text-white transition active:scale-95 ${
                cart.length === 0
                  ? 'cursor-not-allowed bg-slate-300'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              💵 現金
            </button>
            <button
              onClick={() => handleCheckout('card')}
              disabled={cart.length === 0}
              className={`min-h-[48px] rounded-lg font-bold text-white transition active:scale-95 ${
                cart.length === 0
                  ? 'cursor-not-allowed bg-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              💳 刷卡
            </button>
            <button
              onClick={() => handleCheckout('mobile')}
              disabled={cart.length === 0}
              className={`min-h-[48px] rounded-lg font-bold text-white transition active:scale-95 ${
                cart.length === 0
                  ? 'cursor-not-allowed bg-slate-300'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              📱 支付
            </button>
            <button
              onClick={() => handleCheckout('tab')}
              disabled={cart.length === 0}
              className={`min-h-[48px] rounded-lg font-bold text-white transition active:scale-95 ${
                cart.length === 0
                  ? 'cursor-not-allowed bg-slate-300'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              📝 記帳
            </button>
          </div>

          <button
            onClick={() => clearCart()}
            className="mt-2 w-full rounded-lg bg-slate-300 py-2 font-bold text-slate-700 transition hover:bg-slate-400"
          >
            清空購物車
          </button>
        </div>
      </div>
    </div>
  );
}
