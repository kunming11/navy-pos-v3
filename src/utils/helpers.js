/**
 * 工具函式
 * 包含日期格式化、單號生成、計算邏輯等通用工具
 */

/**
 * 格式化日期時間
 * @param {Date} date - 日期物件
 * @returns {string} 格式化後的日期時間字串 (YYYY-MM-DD HH:mm:ss)
 */
export function formatDateTime(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 只格式化日期
 * @param {Date} date - 日期物件
 * @returns {string} 格式化後的日期字串 (YYYY-MM-DD)
 */
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * 生成批次前綴（根據當前日期）
 * @returns {string} 格式為 YYYYMMDD 的前綴
 */
export function generateBatchPrefix() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * 生成完整的訂單號
 * @param {string} prefix - 前綴 (e.g., "20240715")
 * @param {number} sequence - 序號
 * @returns {string} 完整訂單號 (e.g., "20240715-#00001")
 */
export function generateOrderNumber(prefix, sequence) {
  const paddedSeq = String(sequence).padStart(5, '0');
  return `${prefix}-#${paddedSeq}`;
}

/**
 * 計算購物車總額
 * @param {Array} cart - 購物車陣列
 * @returns {number} 總金額
 */
export function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

/**
 * 計算購物車總件數
 * @param {Array} cart - 購物車陣列
 * @returns {number} 總件數
 */
export function calculateCartQuantity(cart) {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/**
 * 格式化貨幣
 * @param {number} amount - 金額
 * @returns {string} 格式化後的貨幣字串
 */
export function formatCurrency(amount) {
  return `$${amount.toLocaleString('zh-TW')}`;
}

/**
 * 驗證 PIN 碼格式
 * @param {string} pin - PIN 碼
 * @returns {boolean} 是否有效
 */
export function validatePin(pin) {
  return /^\d{4,}$/.test(pin);
}

/**
 * 驗證電話號碼格式
 * @param {string} phone - 電話號碼
 * @returns {boolean} 是否有效
 */
export function validatePhone(phone) {
  return /^09\d{8}$/.test(phone);
}

/**
 * 深拷貝物件 (簡易版)
 * @param {*} obj - 要拷貝的物件
 * @returns {*} 深拷貝後的物件
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 按分類分組商品
 * @param {Array} products - 商品陣列
 * @returns {Object} 分組後的物件 {category: [products]}
 */
export function groupProductsByCategory(products) {
  return products.reduce((groups, product) => {
    const category = product.category || '其他';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(product);
    return groups;
  }, {});
}

/**
 * 篩選停售商品
 * @param {Array} products - 商品陣列
 * @returns {Array} 未停售的商品
 */
export function getAvailableProducts(products) {
  return products.filter(p => !p.isDiscontinued);
}

/**
 * 檢查庫存
 * @param {Object} product - 商品物件
 * @param {number} quantity - 購買數量
 * @returns {boolean} 是否有足夠庫存
 */
export function checkStock(product, quantity) {
  if (!product.trackStock) return true;
  return product.stock >= quantity;
}
