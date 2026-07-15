import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_USERS, INITIAL_CATEGORIES, INITIAL_DEPARTMENTS } from '../constants/initialData';
import { formatDateTime, generateBatchPrefix, calculateCartTotal } from '../utils/helpers';

// 使用 Zustand 的 persist 中間件，它會自動幫你同步 localStorage，不需要再寫任何 useEffect！
export const usePosStore = create(
  persist(
    (set, get) => ({
      // --- 1. 核心狀態 (對應你原本的 useState) ---
      users: INITIAL_USERS,
      products: INITIAL_PRODUCTS,
      customers: INITIAL_CUSTOMERS,
      orders: [],
      categories: INITIAL_CATEGORIES,
      departments: INITIAL_DEPARTMENTS,
      logs: [],
      cart: [],
      batchPrefix: '',
      currentUser: null,
      activeCustomer: null,

      // --- 2. 核心商業邏輯 actions (直接搬移你原本的函式) ---
      
      // 登入驗證
      login: (inputPin) => {
        const { users } = get();
        const user = users.find(u => u.pin === inputPin);
        if (user) {
          set({ currentUser: user });
          return user.requireChange ? 'change_password' : 'customer_select';
        }
        return false;
      },

      // 登出
      logout: () => {
        set({ currentUser: null, activeCustomer: null, cart: [] });
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

      // 購物車操作 - 新增商品
      addToCart: (product) => {
        set((state) => {
          const existing = state.cart.find(item => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map(item => 
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
              )
            };
          }
          return { cart: [...state.cart, { ...product, qty: 1 }] };
        });
      },

      // 購物車操作 - 移除商品
      removeFromCart: (id) => {
        set((state) => ({ cart: state.cart.filter(i => i.id !== id) }));
      },

      // 購物車操作 - 更新數量
      updateCartQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          cart: state.cart.map(item => 
            item.id === id ? { ...item, qty } : item
          )
        }));
      },

      // 購物車操作 - 清空購物車
      clearCart: () => {
        set({ cart: [] });
      },

      // 結帳邏輯與庫存連動 (對應原本的 processPayment)
      processPayment: (method) => {
        const { cart, orders, products, customers, activeCustomer, currentUser, batchPrefix } = get();
        if (cart.length === 0 || !activeCustomer) return false;

        let currentPrefix = batchPrefix || generateBatchPrefix();
        const nextSeq = orders.length + 1;
        const paddedSeq = String(nextSeq).padStart(5, '0');
        
        const newOrder = {
          order_id: `${currentPrefix}-#${paddedSeq}`,
          date: formatDateTime(new Date()),
          cashier: currentUser?.name || 'Admin',
          items: [...cart],
          total: calculateCartTotal(cart),
          method: method,
          customer_id: activeCustomer.id,
          customer_name: activeCustomer.name,
          status: 'completed'
        };

        // 扣除庫存
        const updatedProducts = products.map(p => {
          const cartItem = cart.find(c => c.id === p.id);
          return (cartItem && p.trackStock) ? { ...p, stock: Math.max(0, p.stock - cartItem.qty) } : p;
        });

        // 若為記帳 (tab)，更新客戶餘額
        const updatedCustomers = method === 'tab'
          ? customers.map(c => c.id === activeCustomer.id ? { ...c, balance: c.balance + newOrder.total } : c)
          : customers;

        set({
          products: updatedProducts,
          customers: updatedCustomers,
          orders: [newOrder, ...orders],
          cart: [],
          batchPrefix: currentPrefix
        });

        return newOrder;
      },

      // 編輯訂單
      editOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.order_id === orderId ? { ...order, ...updates } : order
          )
        }));
      },

      // 刪除訂單
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(order => order.order_id !== orderId)
        }));
      },

      // 退款處理
      processRefund: (orderId) => {
        const { orders, products, customers } = get();
        const order = orders.find(o => o.order_id === orderId);
        
        if (!order || order.status === 'refunded') return false;

        // 還原庫存
        const updatedProducts = products.map(p => {
          const orderItem = order.items.find(i => i.id === p.id);
          return (orderItem && p.trackStock) ? { ...p, stock: p.stock + orderItem.qty } : p;
        });

        // 若為記帳，取消顧客欠款
        const updatedCustomers = order.method === 'tab'
          ? customers.map(c => c.id === order.customer_id ? { ...c, balance: c.balance - order.total } : c)
          : customers;

        set((state) => ({
          products: updatedProducts,
          customers: updatedCustomers,
          orders: state.orders.map(o =>
            o.order_id === orderId ? { ...o, status: 'refunded' } : o
          )
        }));

        return true;
      },

      // 新增客戶
      addCustomer: (customerData) => {
        const { customers } = get();
        const newCustomer = {
          id: Math.max(...customers.map(c => c.id), 0) + 1,
          ...customerData,
          balance: 0,
          joinDate: new Date().toISOString().split('T')[0]
        };
        set({ customers: [...customers, newCustomer] });
        return newCustomer;
      },

      // 編輯客戶
      editCustomer: (customerId, updates) => {
        set((state) => ({
          customers: state.customers.map(c =>
            c.id === customerId ? { ...c, ...updates } : c
          )
        }));
      },

      // 新增商品
      addProduct: (productData) => {
        const { products } = get();
        const newProduct = {
          id: Math.max(...products.map(p => p.id), 0) + 1,
          ...productData,
          stock: productData.stock || 0,
          trackStock: productData.trackStock !== false,
          isDiscontinued: false
        };
        set({ products: [...products, newProduct] });
        return newProduct;
      },

      // 編輯商品
      editProduct: (productId, updates) => {
        set((state) => ({
          products: state.products.map(p =>
            p.id === productId ? { ...p, ...updates } : p
          )
        }));
      },

      // 切換商品停售狀態
      toggleProductDiscontinued: (productId) => {
        set((state) => ({
          products: state.products.map(p =>
            p.id === productId ? { ...p, isDiscontinued: !p.isDiscontinued } : p
          )
        }));
      },

      // 新增日誌
      addLog: (action, description) => {
        const { logs, currentUser } = get();
        const newLog = {
          id: Date.now(),
          timestamp: formatDateTime(new Date()),
          user: currentUser?.name || 'System',
          action,
          description
        };
        set({ logs: [newLog, ...logs] });
      },

      // 取得訂單統計
      getOrderStats: () => {
        const { orders } = get();
        const completed = orders.filter(o => o.status === 'completed');
        const refunded = orders.filter(o => o.status === 'refunded');
        
        return {
          totalOrders: orders.length,
          completedOrders: completed.length,
          refundedOrders: refunded.length,
          totalRevenue: completed.reduce((sum, o) => sum + o.total, 0),
          refundedAmount: refunded.reduce((sum, o) => sum + o.total, 0)
        };
      },

      // 取得分類商品
      getProductsByCategory: (categoryName) => {
        const { products } = get();
        return products.filter(p => p.category === categoryName && !p.isDiscontinued);
      },

      // 搜尋商品
      searchProducts: (keyword) => {
        const { products } = get();
        const lowerKeyword = keyword.toLowerCase();
        return products.filter(p => 
          p.name.toLowerCase().includes(lowerKeyword) && !p.isDiscontinued
        );
      },

      // 搜尋客戶
      searchCustomers: (keyword) => {
        const { customers } = get();
        const lowerKeyword = keyword.toLowerCase();
        return customers.filter(c =>
          c.name.toLowerCase().includes(lowerKeyword) ||
          c.phone.includes(keyword)
        );
      }
    }),
    {
      name: 'navy_pos_storage', // localStorage 的主鍵名稱
      // 指定哪些資料需要永久儲存在本地端
      partialize: (state) => ({
        users: state.users,
        products: state.products,
        customers: state.customers,
        orders: state.orders,
        categories: state.categories,
        departments: state.departments,
        logs: state.logs,
        batchPrefix: state.batchPrefix,
      }),
    }
  )
);
