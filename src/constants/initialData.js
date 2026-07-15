/**
 * 初始資料常數
 * 包含預設的商品、客戶、員工、分類、部門資料
 */

// 初始商品資料
export const INITIAL_PRODUCTS = [
  { id: 1, name: '經典美式咖啡', price: 60, category: '飲品', stock: 50, trackStock: true, isDiscontinued: false },
  { id: 2, name: '原味拿鐵', price: 80, category: '飲品', stock: 40, trackStock: true, isDiscontinued: false },
  { id: 3, name: '招牌三明治', price: 65, category: '輕食', stock: 30, trackStock: true, isDiscontinued: false },
  { id: 4, name: '季節限定特調', price: 90, category: '飲品', stock: 20, trackStock: true, isDiscontinued: true },
  { id: 5, name: '草莓起司蛋糕', price: 85, category: '甜點', stock: 25, trackStock: true, isDiscontinued: false },
  { id: 6, name: '抹茶拿鐵', price: 75, category: '飲品', stock: 35, trackStock: true, isDiscontinued: false },
  { id: 7, name: '焦糖瑪奇朵', price: 70, category: '飲品', stock: 45, trackStock: true, isDiscontinued: false },
  { id: 8, name: '檸檬派', price: 55, category: '甜點', stock: 20, trackStock: true, isDiscontinued: false },
];

// 初始客戶資料
export const INITIAL_CUSTOMERS = [
  { id: 1, name: '王小明', phone: '0912345678', balance: 0, joinDate: '2024-01-15' },
  { id: 2, name: '李美麗', phone: '0987654321', balance: 500, joinDate: '2024-02-20' },
  { id: 3, name: '張三郎', phone: '0933445566', balance: 0, joinDate: '2024-03-10' },
  { id: 4, name: '陳小帥', phone: '0966778899', balance: 1200, joinDate: '2024-01-05' },
  { id: 5, name: '黃金花', phone: '0955443322', balance: 0, joinDate: '2024-04-01' },
];

// 初始員工/使用者資料
export const INITIAL_USERS = [
  { id: 1, name: '管理員', pin: '1234', role: 'admin', department: '管理', requireChange: false },
  { id: 2, name: '收銀員A', pin: '0001', role: 'cashier', department: '收銀', requireChange: false },
  { id: 3, name: '收銀員B', pin: '0002', role: 'cashier', department: '收銀', requireChange: false },
  { id: 4, name: '外場服務', pin: '0003', role: 'staff', department: '外場', requireChange: false },
];

// 商品分類
export const INITIAL_CATEGORIES = [
  { id: 1, name: '飲品', icon: '🥤' },
  { id: 2, name: '輕食', icon: '🥪' },
  { id: 3, name: '甜點', icon: '🍰' },
  { id: 4, name: '其他', icon: '📦' },
];

// 部門資料
export const INITIAL_DEPARTMENTS = [
  { id: 1, name: '管理' },
  { id: 2, name: '收銀' },
  { id: 3, name: '外場' },
  { id: 4, name: '廚房' },
];

// 支付方式
export const PAYMENT_METHODS = [
  { id: 'cash', name: '現金', icon: '💵' },
  { id: 'card', name: '刷卡', icon: '💳' },
  { id: 'mobile', name: '行動支付', icon: '📱' },
  { id: 'tab', name: '記帳', icon: '📝' },
];

// 訂單狀態
export const ORDER_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
};
