import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==========================================
// 1. 你的真正海軍初始資料 (100% 原汁原味還原)
// ==========================================
const INITIAL_PRODUCTS = [
  { id: 'P001', name: '暈船藥', price: 150, category: '藥品', stock: 45, barcode: '88001', isOnSale: true, trackStock: true },
  { id: 'P002', name: '可口可樂', price: 30, category: '飲料', stock: 110, barcode: '88002', isOnSale: true, trackStock: true },
  { id: 'P003', name: '海鮮泡麵', price: 45, category: '食品', stock: 75, barcode: '88003', isOnSale: true, trackStock: true },
  { id: 'P004', name: '七星香菸', price: 125, category: '雜貨', stock: 190, barcode: '88004', isOnSale: true, trackStock: true },
  { id: 'P005', name: '打火機', price: 20, category: '雜貨', stock: 48, barcode: '88005', isOnSale: true, trackStock: true },
  { id: 'P006', name: '礦泉水', price: 20, category: '飲料', stock: 180, barcode: '88006', isOnSale: true, trackStock: true },
  { id: 'P008', name: '藍白拖', price: 100, category: '雜貨', stock: 20, barcode: '88007', isOnSale: true, trackStock: true },
];

const INITIAL_DEPARTMENTS = ['官員', '1隊', '2隊', '3隊', '4隊', '5隊', '6隊', '7隊'];

const INITIAL_CUSTOMERS = [
  { id: 'C001', name: '張三(艦長)', dept: '官員', balance: 0 },
  { id: 'C002', name: '李四', dept: '1隊', balance: 0 },
  { id: 'C003', name: '王五', dept: '2隊', balance: 0 },
  { id: 'C004', name: '趙六', dept: '3隊', balance: 0 },
  { id: 'C005', name: '何七', dept: '4隊', balance: 0 },
  { id: 'C006', name: '顏八', dept: '5隊', balance: 0 },
  { id: 'C007', name: '陳九', dept: '6隊', balance: 0 },
  { id: 'C008', name: '黃十', dept: '7隊', balance: 0 },
];

const INITIAL_USERS = [
  { id: 'U001', name: '輔導長', pin: '1234', role: 'admin', requireChange: true },
  { id: 'U002', name: '福利委員', pin: '0000', role: 'staff', requireChange: false },
];

const INITIAL_CATEGORIES = ['雜貨', '飲料', '食品', '藥品'];

// 工具函式：日期格式化
const formatDateTime = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
};

const generateBatchPrefix = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 2; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

// ==========================================
// 2. Zustand 核心大腦與持久化儲存
// ==========================================
export const usePosStore = create(
  persist(
    (set, get) => ({
      // 核心狀態
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      users: INITIAL_USERS,
      categories: INITIAL_CATEGORIES,
      departments: INITIAL_DEPARTMENTS,
      orders: [],
      logs: [],
      cart: [],
      batchPrefix: '',
      currentUser: INITIAL_USERS[0], // 預設先以輔導長登入，方便你現在看畫面
      activeCustomer: INITIAL_CUSTOMERS[0], // 預設先選張三艦長

      // 排序與查詢工具
      getSortedProducts: () => {
        return [...get().products].sort((a, b) => (b.isOnSale ? 1 : 0) - (a.isOnSale ? 1 : 0));
      },

      // 購物車動作
      addToCart: (product) => {
        if (!product.isOnSale || (product.trackStock && product.stock <= 0)) return;
        set((state) => {
          const existing = state.cart.find((i) => i.id === product.id);
          if (existing) {
            return { cart: state.cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i)) };
          }
          return { cart: [...state.cart, { ...product, qty: 1 }] };
        });
      },

      updateCartQty: (id, delta) => {
        set((state) => ({
          cart: state.cart
            .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
            .filter((i) => i.qty > 0),
        }));
      },

      removeFromCart: (id) => {
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) }));
      },

      clearCart: () => set({ cart: [] }),

      // 結帳與庫存/記帳連動邏輯
      processPayment: (method) => {
        const { cart, orders, products, customers, activeCustomer, currentUser, batchPrefix } = get();
        if (cart.length === 0 || !activeCustomer) return false;

        let currentPrefix = batchPrefix || generateBatchPrefix();
        const nextSeq = String(orders.length + 1).padStart(5, '0');
        const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

        const newOrder = {
          order_id: `${currentPrefix}-#${nextSeq}`,
          date: formatDateTime(),
          cashier: currentUser?.name || '管理員',
          items: cart,
          total: total,
          method: method, // 'cash' 或 'tab' (記帳)
          customer_id: activeCustomer.id,
          customer_name: activeCustomer.name,
          status: 'completed',
        };

        // 扣除庫存
        const updatedProducts = products.map((p) => {
          const item = cart.find((c) => c.id === p.id);
          return item && p.trackStock ? { ...p, stock: p.stock - item.qty } : p;
        });

        // 若為記帳，累加個人負債
        const updatedCustomers = method === 'tab'
          ? customers.map((c) => (c.id === activeCustomer.id ? { ...c, balance: c.balance + total } : c))
          : customers;

        // 寫入日誌
        const newLog = {
          id: Date.now(),
          type: 'create',
          time: formatDateTime(),
          cashier: currentUser?.name || 'Admin',
          order_id: newOrder.order_id,
          total: total,
          method: method,
          customer_name: activeCustomer.name,
        };

        set({
          products: updatedProducts,
          customers: updatedCustomers,
          orders: [newOrder, ...orders],
          logs: [newLog, ...get().logs],
          cart: [],
          batchPrefix: currentPrefix,
        });

        return true;
      },

      // 基礎 Setter
      setProducts: (val) => set({ products: typeof val === 'function' ? val(get().products) : val }),
      setCustomers: (val) => set({ customers: typeof val === 'function' ? val(get().customers) : val }),
      setUsers: (val) => set({ users: typeof val === 'function' ? val(get().users) : val }),
      setCurrentUser: (user) => set({ currentUser: user }),
      setActiveCustomer: (customer) => set({ activeCustomer: customer }),

      // 登出
      logout: () => set({ currentUser: null, activeCustomer: null, cart: [] }),

      // 簡單登入
      login: (inputPin) => {
        const { users } = get();
        const user = users.find(u => u.pin === inputPin);
        if (user) {
          set({ currentUser: user });
          return true;
        }
        return false;
      },

      // 選擇客戶
      selectCustomer: (customerId) => {
        const { customers } = get();
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          set({ activeCustomer: customer });
          return true;
        }
        return false;
      },
    }),
    {
      name: 'pos_navy_storage_v3', // 升級專屬的儲存庫名稱，不受舊咖啡廳緩存污染
    }
  )
);
