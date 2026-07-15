import { create } from 'zustand';

// 初始商品範例資料（後續可直接替換為你真實的菜單/商品清單）
const initialProducts = [
  { id: 1, name: '經典美式咖啡', price: 60, category: '飲品', isDiscontinued: false },
  { id: 2, name: '原味拿鐵', price: 80, category: '飲品', isDiscontinued: false },
  { id: 3, name: '招牌三明治', price: 65, category: '輕食', isDiscontinued: false },
  { id: 4, name: '季節限定特調', price: 90, category: '飲品', isDiscontinued: true }, // 停售商品會自動沉底
];

export const usePosStore = create((set, get) => ({
  // --- 1. 核心狀態 (State) ---
  products: initialProducts,
  cart: [],
  orderPrefix: 'A1',
  orderSequence: 1,

  // --- 2. 衍生查詢與排序邏輯 (Getters) ---
  // 自動將「已停售」商品移到列表最下方，保持收銀畫面整潔
  getSortedProducts: () => {
    return [...get().products].sort((a, b) => {
      if (a.isDiscontinued === b.isDiscontinued) return 0;
      return a.isDiscontinued ? 1 : -1;
    });
  },
  // 計算購物車總金額
  getTotalPrice: () => {
    return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
  },
  // 生成標準流水單號（例如：A1-#00001）
  getCurrentOrderNumber: () => {
    const { orderPrefix, orderSequence } = get();
    const paddedSeq = String(orderSequence).padStart(5, '0');
    return `${orderPrefix}-#${paddedSeq}`;
  },

  // --- 3. 業務動作 (Actions) ---
  // 加入商品至購物車
  addToCart: (product) => {
    if (product.isDiscontinued) return; // 停售品項防護
    set((state) => {
      const existingItem = state.cart.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
    });
  },
  // 減少或移除商品
  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart
        .map((item) => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    }));
  },
  // 清空購物車
  clearCart: () => set({ cart: [] }),
  // 確認結帳並將流水號遞增
  checkout: () => {
    const currentOrder = get().getCurrentOrderNumber();
    const total = get().getTotalPrice();
    if (total === 0) return null;

    set((state) => ({
      cart: [],
      orderSequence: state.orderSequence + 1,
    }));
    return currentOrder;
  },
}));
