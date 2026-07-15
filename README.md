# Navy POS v3 - 點餐收銀系統

現代化的 iPad 友善點餐收銀解決方案，採用 React + Zustand + Tailwind CSS 構建。

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```

訪問 `http://localhost:5173` 開始使用。

### 構建生產版本
```bash
npm run build
```

## 📁 專案結構

```
src/
├── store/
│   └── usePosStore.js       # Zustand 狀態管理
├── components/
│   └── PosView.jsx          # 主控台 UI 組件
├── App.jsx                  # 應用程式入口
├── main.jsx                 # React 初始化
└── index.css                # Tailwind CSS 導入
```

## ✨ 功能特性

- 🛒 **購物車管理** - 實時加減商品、計算總額
- 📊 **商品展示** - 響應式網格，停售品項自動沉底
- 🧾 **訂單管理** - 自動生成流水號、結帳記錄
- 📱 **iPad 優化** - 橫向/縱向响應式設計
- ⚡ **性能優先** - Zustand 最小化重繪，無不必要計算
- 🎨 **美觀簡潔** - Tailwind CSS 現代設計

## 🔧 技術棧

- **React 18** - 前端框架
- **Zustand 4** - 輕量狀態管理
- **Tailwind CSS 3** - 原子化 CSS
- **Vite 5** - 極速打包工具

## 📝 使用說明

1. 點擊左側商品按鈕新增至購物車
2. 右側購物車可調整數量或移除商品
3. 確認結帳後自動遞增單號，清空購物車

## 🚫 已停售商品

已停售的商品會自動移至列表下方，點擊時無效。
