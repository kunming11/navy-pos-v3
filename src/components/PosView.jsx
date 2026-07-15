import React from 'react';
import { usePosStore } from '../store/usePosStore';

export default function PosView() {
  // 從 Zustand 提取狀態與方法 (UI 與業務邏輯徹底分離)
  const sortedProducts = usePosStore((state) => state.getSortedProducts());
  const cart = usePosStore((state) => state.cart);
  const totalPrice = usePosStore((state) => state.getTotalPrice());
  const orderNumber = usePosStore((state) => state.getCurrentOrderNumber());
  const addToCart = usePosStore((state) => state.addToCart);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  const checkout = usePosStore((state) => state.checkout);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-100 font-sans select-none md:flex-row">
      {/* 左側：商品點選矩陣 (針對 iPad 橫向收銀優化) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">點餐收銀主控台</h1>
          <span className="rounded-lg bg-blue-100 px-4 py-2 font-mono text-base font-bold text-blue-800 shadow-sm">
            目前單號：{orderNumber}
          </span>
        </header>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
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
        <h2 className="mb-4 text-xl font-bold text-slate-800">當前交易明細</h2>

        {/* 購物車品項列表 */}
        <div className="flex-1 overflow-y-auto">
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
                    <div className="text-sm font-semibold text-slate-500">${item.price} x {item.quantity}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-200 text-xl font-black text-slate-600 transition active:scale-90 active:bg-slate-300"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
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
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="mb-4 flex items-center justify-between font-bold text-slate-800">
            <span className="text-lg">應付總額</span>
            <span className="text-3xl font-black text-blue-600">${totalPrice}</span>
          </div>
          <button
            onClick={() => {
              const order = checkout();
              if (order) alert(`✅ 結帳成功！\n交易單號：${order}\n請準備為下位顧客點餐。`);
            }}
            disabled={cart.length === 0}
            className={`min-h-[60px] w-full rounded-2xl text-xl font-bold text-white shadow-lg transition active:scale-98 ${
              cart.length === 0
                ? 'cursor-not-allowed bg-slate-300 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-blue-200'
            }`}
          >
            確認結帳 ({cart.reduce((sum, i) => sum + i.quantity, 0)} 件)
          </button>
        </div>
      </div>
    </div>
  );
}
