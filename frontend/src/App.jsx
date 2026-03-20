import { useState, useEffect, useMemo, createContext, useContext } from "react";

// ─── API Base URL ───
const API = "/api";

// ─── API Helper ───
const api = {
  get: async (path, token) => {
    const res = await fetch(`${API}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Request failed"); }
    return res.json();
  },
  post: async (path, body, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Request failed"); }
    return res.json();
  },
  patch: async (path, body, token) => {
    const res = await fetch(`${API}${path}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error || "Request failed"); }
    return res.json();
  },
};

// ─── Contexts ───
const ThemeContext = createContext();
const useTheme = () => useContext(ThemeContext);
const LangContext = createContext();
const useLang = () => useContext(LangContext);

// ─── Translation Dictionary ───
const TRANSLATIONS = {
  en: {
    // General
    marketplace: "Marketplace", searchMarketplace: "Search marketplace", signIn: "Sign In", signOut: "Sign Out",
    register: "Register", login: "Login", buyAndSell: "Buy and sell, beautifully.",
    buyer: "Buyer", seller: "Seller", admin: "Admin", email: "Email", password: "Password",
    fullName: "Full name", iAmA: "I am a", createAccount: "Create Account", forgotPassword: "Forgot password?",
    newAccountWallet: "New accounts start with $0 wallet balance", pleaseWait: "Please wait...",
    adminHint: "Admin: admin@gmail.com / admin123456", fillAllFields: "Please fill in all fields.",
    pwMin6: "Password must be at least 6 characters.",
    // Nav
    wallet: "Wallet", myOrders: "My Orders", incomingOrders: "Incoming Orders", myEarnings: "My Earnings",
    settings: "Settings", browseStore: "Browse Store", adminPanel: "Admin Panel",
    // Home
    springCollection: "SPRING COLLECTION", discoverNew: "Discover what's new.",
    curatedCollections: "Curated collections from the best sellers on our platform.",
    todaysDeals: "Today's Deals", trendingNow: "Trending Now", allProducts: "All Products",
    resultsFor: "Results for", items: "items", noProductsFound: "No products found",
    freeShipping: "Free shipping", sold: "sold",
    // Product Detail
    back: "Back", condition: "Condition", inStock: "In Stock", shipping: "Shipping",
    free: "Free", quantity: "Quantity", addToBag: "Add to Bag", buyNow: "Buy Now",
    youSave: "You save", reviews: "reviews", units: "units",
    // Cart
    yourBag: "Your Bag", continueShopping: "Continue shopping", bagEmpty: "Your bag is empty",
    orderSummary: "Order Summary", subtotal: "Subtotal", tax: "Tax", total: "Total",
    checkout: "Checkout",
    // Checkout
    shippingAddress: "Shipping Address", address: "Address", city: "City",
    postalCode: "Postal code", country: "Country", contactInfo: "Contact Information",
    phoneNumber: "Phone number", deliveryUpdates: "We'll send delivery updates to this number.",
    payment: "Payment", paymentMethod: "Payment Method", payWithCard: "Pay with Card",
    balance: "Balance", noCardsSaved: "No cards saved. Add one in your Wallet page.",
    goToWallet: "Go to Wallet", topUpWallet: "Top Up Wallet",
    needMore: "more", insufficientBalance: "Insufficient balance",
    afterPurchase: "After purchase", continueToPayment: "Continue to Payment",
    pay: "Pay", processing: "Processing...",
    orderConfirmed: "Order Confirmed", thankYouPurchase: "Thank you for your purchase!",
    orderId: "Order ID", shipTo: "Ship to", phone: "Phone",
    fillAddress: "Please fill in your shipping address.",
    validPhone: "Please enter a valid contact number.",
    selectCard: "Please select a card.",
    // Orders
    noOrdersYet: "No orders yet. Start shopping!", cancelRequested: "Cancel Requested",
    requestCancellation: "Request Cancellation", whyCancelQ: "Why do you want to cancel?",
    explainReason: "Please explain your reason...", submitRequest: "Submit Request",
    neverMind: "Never mind", cancelRequestPending: "Cancel request: pending",
    cancelRequestApproved: "Cancel request: approved", cancelRequestRejected: "Cancel request: rejected",
    reason: "Reason", sellerResponse: "Seller response", provideReason: "Please provide a reason.",
    paymentAndContact: "PAYMENT & CONTACT",
    // Seller Orders
    totalOrders: "total orders", cancellationRequests: "cancellation request",
    all: "All", confirmed: "Confirmed", shipped: "Shipped", delivered: "Delivered",
    cancellations: "Cancellations", buyerCancelReason: "Buyer's cancellation reason:",
    approveRefund: "Approve Refund", reject: "Reject", rejectExplain: "Explain why you're rejecting (optional):",
    confirmReject: "Confirm Reject", cancel: "Cancel", confirmOrder: "Confirm Order",
    markShipped: "Mark as Shipped", markDelivered: "Mark Delivered",
    confirmPrepare: "Confirm to start preparing this order",
    handedCourier: "Mark when you've handed it to the courier",
    buyerReceived: "Mark when buyer has received the item",
    orderCompleted: "Order completed successfully", orderRefunded: "Order refunded to buyer",
    cancelledByBuyer: "Cancellation requested by buyer", noOrdersFilter: "No orders",
    // Wallet
    availableBalance: "Available Balance", cardsLinked: "cards linked",
    overview: "Overview", topup: "Top Up", cards: "Cards", history: "History",
    totalDeposited: "Total Deposited", totalSpent: "Total Spent",
    recentTransactions: "Recent Transactions", noTransactions: "No transactions yet. Add a card and top up to get started.",
    topUpWalletTitle: "Top Up Wallet", needCardFirst: "You need to add a card first.",
    addCard: "Add a Card", selectCardLabel: "Select card", amount: "Amount",
    enterCustomAmount: "Or enter custom amount", enterAmount: "Enter amount",
    maxTopup: "Maximum $10,000 per top-up.", cardAdded: "Card added successfully!",
    addNewCard: "Add New Card", newCard: "New Card", cardNumber: "Card number",
    cardholderName: "Cardholder name", expiry: "Expiry", anyDigitsWork: "Any 16-digit number works for this demo.",
    totalToppedUp: "Total topped up", allTransactions: "All Transactions",
    noTransactionsYet: "No transactions yet",
    // Seller Earnings
    earnings: "Earnings", grossSales: "Gross Sales", commission: "Commission (5%)",
    netEarnings: "Net Earnings", walletBalance: "Wallet Balance",
    itemsSold: "Items Sold", earningsByProduct: "Earnings by Product",
    product: "Product", price: "Price", unitsSold: "Units Sold",
    gross: "Gross", netEarningsCol: "Net Earnings",
    noEarningsYet: "No transactions yet. Earnings appear here when buyers purchase your products.",
    // Admin
    metrics: "Metrics", users: "Users", finance: "Finance", orders: "Orders",
    totalUsers: "Total Users", activeListings: "Active Listings", revenue: "Revenue",
    pendingOrders: "pending", ordersThisWeek: "orders this week",
    allUsersCount: "All Users", active: "Active", suspended: "Suspended",
    totalRevenue: "Total Revenue", platformFees: "Platform Fees (5%)", totalTax: "Total Tax",
    revenueBy: "Revenue by", revenueBySeller: "Revenue by Seller",
    revenueByCategory: "Revenue by Category", store: "Store",
    platformFee: "Platform Fee", netToSeller: "Net to Seller",
    allOrdersCount: "All Orders", date: "Date", status: "Status",
    // Settings
    appearance: "Appearance", account: "Account", theme: "Theme",
    light: "Light", dark: "Dark", accentColor: "Accent Color",
    accountDetails: "Account Details", name: "Name", role: "Role",
    memberSince: "Member Since", cardsSaved: "cards saved",
    // Footer
    shop: "Shop", sell: "Sell", help: "Help", about: "About",
    categories: "Categories", deals: "Deals", trending: "Trending", newArrivals: "New Arrivals",
    startSelling: "Start Selling", sellerHub: "Seller Hub", fees: "Fees",
    helpCenter: "Help Center", contactUs: "Contact Us", returns: "Returns",
    aboutUs: "About Us", careers: "Careers", press: "Press",
    terms: "Terms", privacy: "Privacy", cookies: "Cookies",
    allRightsReserved: "2026 Marketplace. All rights reserved.",
  },
  zh: {
    marketplace: "市集商城", searchMarketplace: "搜尋商品", signIn: "登入", signOut: "登出",
    register: "註冊", login: "登入", buyAndSell: "買賣，從未如此優雅。",
    buyer: "買家", seller: "賣家", admin: "管理員", email: "電子郵件", password: "密碼",
    fullName: "姓名", iAmA: "我的身份", createAccount: "建立帳號", forgotPassword: "忘記密碼？",
    newAccountWallet: "新帳號初始錢包餘額為 $0", pleaseWait: "請稍候...",
    adminHint: "管理員：admin@gmail.com / admin123456", fillAllFields: "請填寫所有欄位。",
    pwMin6: "密碼至少需要6個字元。",
    wallet: "錢包", myOrders: "我的訂單", incomingOrders: "收到的訂單", myEarnings: "我的收益",
    settings: "設定", browseStore: "瀏覽商店", adminPanel: "管理面板",
    springCollection: "春季系列", discoverNew: "探索最新商品。",
    curatedCollections: "來自平台上最優質賣家的精選商品。",
    todaysDeals: "今日特惠", trendingNow: "熱門推薦", allProducts: "全部商品",
    resultsFor: "搜尋結果：", items: "件商品", noProductsFound: "找不到商品",
    freeShipping: "免運費", sold: "已售出",
    back: "返回", condition: "商品狀況", inStock: "庫存", shipping: "運費",
    free: "免費", quantity: "數量", addToBag: "加入購物袋", buyNow: "立即購買",
    youSave: "節省", reviews: "則評價", units: "件",
    yourBag: "購物袋", continueShopping: "繼續購物", bagEmpty: "您的購物袋是空的",
    orderSummary: "訂單摘要", subtotal: "小計", tax: "稅金", total: "總計",
    checkout: "結帳",
    shippingAddress: "收貨地址", address: "地址", city: "城市",
    postalCode: "郵遞區號", country: "國家", contactInfo: "聯絡資訊",
    phoneNumber: "手機號碼", deliveryUpdates: "我們會將配送更新發送至此號碼。",
    payment: "付款", paymentMethod: "付款方式", payWithCard: "信用卡付款",
    balance: "餘額", noCardsSaved: "尚未儲存任何卡片，請先到錢包頁面新增。",
    goToWallet: "前往錢包", topUpWallet: "儲值",
    needMore: "不足", insufficientBalance: "餘額不足",
    afterPurchase: "購買後餘額", continueToPayment: "前往付款",
    pay: "支付", processing: "處理中...",
    orderConfirmed: "訂單已確認", thankYouPurchase: "感謝您的購買！",
    orderId: "訂單編號", shipTo: "寄送至", phone: "電話",
    fillAddress: "請填寫收貨地址。", validPhone: "請輸入有效的聯絡電話。",
    selectCard: "請選擇一張卡片。",
    noOrdersYet: "尚無訂單，開始購物吧！", cancelRequested: "已申請取消",
    requestCancellation: "申請取消", whyCancelQ: "您為什麼要取消？",
    explainReason: "請說明您的原因...", submitRequest: "提交申請",
    neverMind: "算了", cancelRequestPending: "取消申請：等待中",
    cancelRequestApproved: "取消申請：已批准", cancelRequestRejected: "取消申請：已拒絕",
    reason: "原因", sellerResponse: "賣家回覆", provideReason: "請提供原因。",
    paymentAndContact: "付款與聯絡資訊",
    totalOrders: "筆訂單", cancellationRequests: "筆取消申請",
    all: "全部", confirmed: "已確認", shipped: "已出貨", delivered: "已送達",
    cancellations: "取消申請", buyerCancelReason: "買家取消原因：",
    approveRefund: "批准退款", reject: "拒絕", rejectExplain: "說明拒絕原因（選填）：",
    confirmReject: "確認拒絕", cancel: "取消", confirmOrder: "確認訂單",
    markShipped: "標記為已出貨", markDelivered: "標記為已送達",
    confirmPrepare: "確認後開始準備此訂單",
    handedCourier: "交給快遞時點擊標記",
    buyerReceived: "買家收到貨時點擊標記",
    orderCompleted: "訂單已成功完成", orderRefunded: "已退款給買家",
    cancelledByBuyer: "買家已申請取消", noOrdersFilter: "沒有訂單",
    availableBalance: "可用餘額", cardsLinked: "張已綁定卡片",
    overview: "概覽", topup: "儲值", cards: "卡片", history: "紀錄",
    totalDeposited: "累計儲值", totalSpent: "累計消費",
    recentTransactions: "最近交易", noTransactions: "尚無交易紀錄，請先新增卡片並儲值。",
    topUpWalletTitle: "錢包儲值", needCardFirst: "您需要先新增一張卡片。",
    addCard: "新增卡片", selectCardLabel: "選擇卡片", amount: "金額",
    enterCustomAmount: "或輸入自訂金額", enterAmount: "輸入金額",
    maxTopup: "每次最高儲值 $10,000。", cardAdded: "卡片新增成功！",
    addNewCard: "新增卡片", newCard: "新卡片", cardNumber: "卡號",
    cardholderName: "持卡人姓名", expiry: "到期日", anyDigitsWork: "本演示版接受任何16位數字。",
    totalToppedUp: "累計儲值", allTransactions: "全部交易紀錄",
    noTransactionsYet: "尚無交易紀錄",
    earnings: "收益", grossSales: "銷售總額", commission: "平台佣金 (5%)",
    netEarnings: "淨收益", walletBalance: "錢包餘額",
    itemsSold: "已售商品", earningsByProduct: "商品收益明細",
    product: "商品", price: "價格", unitsSold: "售出數量",
    gross: "總額", netEarningsCol: "淨收益",
    noEarningsYet: "尚無交易紀錄。當買家購買您的商品時，收益將會顯示在這裡。",
    metrics: "數據總覽", users: "使用者", finance: "財務", orders: "訂單",
    totalUsers: "使用者總數", activeListings: "上架商品", revenue: "營收",
    pendingOrders: "待處理", ordersThisWeek: "本週訂單",
    allUsersCount: "所有使用者", active: "啟用中", suspended: "已停權",
    totalRevenue: "總營收", platformFees: "平台費用 (5%)", totalTax: "稅金總額",
    revenueBy: "營收來源", revenueBySeller: "賣家營收",
    revenueByCategory: "分類營收", store: "商店",
    platformFee: "平台費", netToSeller: "賣家淨收",
    allOrdersCount: "全部訂單", date: "日期", status: "狀態",
    appearance: "外觀", account: "帳號", theme: "主題",
    light: "淺色", dark: "深色", accentColor: "強調色",
    accountDetails: "帳號資訊", name: "姓名", role: "身份",
    memberSince: "加入日期", cardsSaved: "張已儲存卡片",
    shop: "購物", sell: "銷售", help: "幫助", about: "關於",
    categories: "分類", deals: "特惠", trending: "熱門", newArrivals: "新品上架",
    startSelling: "開始銷售", sellerHub: "賣家中心", fees: "費用",
    helpCenter: "幫助中心", contactUs: "聯絡我們", returns: "退貨",
    aboutUs: "關於我們", careers: "人才招募", press: "媒體",
    terms: "使用條款", privacy: "隱私權", cookies: "Cookie 政策",
    allRightsReserved: "2026 市集商城。版權所有。",
  },
};

// Translation hook
const useT = () => {
  const { lang } = useLang();
  return (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
};

// ─── Colors ───
const getColors = (theme, accentColor) => {
  const d = theme === "dark";
  const am = { blue: d?"#0a84ff":"#0071e3", purple: d?"#bf5af2":"#6e3adb", green: d?"#30d158":"#248a3d", orange: d?"#ff9f0a":"#c93400", pink: d?"#ff375f":"#d4317f", red: d?"#ff453a":"#d70015" };
  return { bg: d?"#000":"#fafafa", cardBg: d?"#1a1a1a":"#fff", text: d?"#f5f5f7":"#1d1d1f", textSec: d?"#86868b":"#6e6e73", border: d?"#333":"#e5e5e5", accent: am[accentColor]||am.blue, navBg: d?"rgba(0,0,0,0.85)":"rgba(255,255,255,0.85)", inputBg: d?"#111":"#fafafa", hoverBg: d?"#222":"#f5f5f7", pillBg: d?"#2a2a2a":"#f5f5f7", tabActive: d?"#333":"#fff" };
};
const useColors = () => { const { theme, accentColor } = useTheme(); return getColors(theme, accentColor); };

// ─── Icons ───
const I = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Heart: ({f}) => <svg width="18" height="18" viewBox="0 0 24 24" fill={f?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 000-7.8z"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>,
  Package: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16.5 9.4l-9-5.2M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.3 7L12 12l8.7-5M12 22V12"/></svg>,
  BarChart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>,
  DollarSign: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Minus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>,
  ArrowLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>,
  Sun: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>,
  Moon: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><path d="M9 22V12h6v10"/></svg>,
  MessageSquare: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>,
  AlertTriangle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M10.3 3.9L1.7 18a2 2 0 001.7 3h17.1a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01"/></svg>,
  Layers: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
  CreditCard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>,
  Wallet: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 100 4h4v-4z"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
};

// ─── Star Rating ───
const StarRating = ({ rating, size = 14 }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px", color: "#f59e0b" }}>
    {[1,2,3,4,5].map(i => <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i<=Math.round(rating)?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
  </span>
);

// ─── Reusable Input ───
const Input = ({ label, ...props }) => {
  const c = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{label}</label>}
      <input {...props} onFocus={e => { setFocused(true); props.onFocus?.(e); }} onBlur={e => { setFocused(false); props.onBlur?.(e); }} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${focused ? c.accent : c.border}`, background: c.inputBg, color: c.text, fontSize: "16px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", ...props.style }} />
    </div>
  );
};

// ─── Button ───
const Btn = ({ children, variant = "primary", full, disabled, style: sx, ...props }) => {
  const c = useColors();
  const base = { padding: "14px 28px", borderRadius: "14px", fontSize: "16px", fontWeight: "600", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", border: "none", width: full ? "100%" : undefined, opacity: disabled ? 0.6 : 1, ...sx };
  if (variant === "primary") return <button {...props} disabled={disabled} style={{ ...base, background: c.accent, color: "#fff" }}>{children}</button>;
  if (variant === "outline") return <button {...props} disabled={disabled} style={{ ...base, background: "transparent", border: `1.5px solid ${c.accent}`, color: c.accent }}>{children}</button>;
  return <button {...props} disabled={disabled} style={{ ...base, background: c.pillBg, color: c.text }}>{children}</button>;
};

// ─── Toast ───
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const bg = type === "success" ? "#34c759" : type === "error" ? "#ff3b30" : "#ff9f0a";
  return <div style={{ position: "fixed", top: "72px", right: "20px", zIndex: 9999, background: bg, color: "#fff", padding: "14px 24px", borderRadius: "14px", fontSize: "15px", fontWeight: "500", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", animation: "slideDown 0.3s ease", display: "flex", alignItems: "center", gap: "10px" }}>{type === "success" && <I.Check />} {message}</div>;
};

// ─── Loading Spinner ───
const Spinner = ({ size = 24 }) => {
  const c = useColors();
  return <div style={{ width: size, height: size, border: `3px solid ${c.border}`, borderTopColor: c.accent, borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />;
};

// ════════════════════════════════════════
// LOGIN PAGE (calls real API)
// ════════════════════════════════════════
const LoginPage = ({ onLogin }) => {
  const c = useColors();
  const { lang, setLang } = useLang();
  const t = useT();
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (mode === "register" && (!name || !email || !password)) return setError(t("fillAllFields"));
    if (mode === "login" && (!email || !password)) return setError(t("fillAllFields"));
    if (mode === "register" && password.length < 6) return setError(t("pwMin6"));
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login" ? { email, password } : { email, password, name, role };
      const data = await api.post(endpoint, body);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <div style={{ width: "100%", maxWidth: "400px", animation: "fadeIn 0.6s ease" }}>
        {/* Language toggle on login page */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
          <button onClick={() => setLang(lang==="en"?"zh":"en")} style={{ padding: "6px 16px", borderRadius: "50px", border: `1px solid ${c.border}`, background: c.cardBg, cursor: "pointer", fontSize: "13px", fontWeight: "600", color: c.text }}>{lang==="en" ? "中文" : "English"}</button>
        </div>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "42px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "8px" }}>{t("marketplace")}</div>
          <p style={{ color: c.textSec, fontSize: "17px" }}>{t("buyAndSell")}</p>
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "36px", boxShadow: c.bg === "#000" ? "0 0 0 1px rgba(255,255,255,0.08)" : "0 2px 20px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", background: c.pillBg, borderRadius: "10px", padding: "3px", marginBottom: "24px" }}>
            {[["login",t("login")],["register",t("register")]].map(([m,label]) => <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: mode===m ? c.tabActive : "transparent", color: mode===m ? c.text : c.textSec, fontWeight: "500", fontSize: "14px", cursor: "pointer", boxShadow: mode===m ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>{label}</button>)}
          </div>
          {mode === "register" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{t("iAmA")}</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {[["buyer",t("buyer")],["seller",t("seller")]].map(([r,label]) => <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: "12px", borderRadius: "12px", border: `1.5px solid ${role===r ? c.accent : c.border}`, background: role===r ? c.accent+"14" : "transparent", color: role===r ? c.accent : c.textSec, fontWeight: "500", fontSize: "14px", cursor: "pointer" }}>{label}</button>)}
              </div>
            </div>
          )}
          {error && <div style={{ background: "#ff3b3014", border: "1px solid #ff3b3044", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: "#ff3b30", fontWeight: "500" }}>{error}</div>}
          {mode === "register" && <Input label={t("fullName")} value={name} onChange={e => setName(e.target.value)} placeholder="John Appleseed" />}
          <Input label={t("email")} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
          <Input label={t("password")} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t("pwMin6")} />
          <Btn full disabled={loading} onClick={handleSubmit} style={{ padding: "16px", fontSize: "17px", marginTop: "8px" }}>{loading ? t("pleaseWait") : mode === "login" ? t("signIn") : t("createAccount")}</Btn>
          {mode === "register" && <p style={{ fontSize: "13px", color: c.textSec, textAlign: "center", marginTop: "16px" }}>{t("newAccountWallet")}</p>}
        </div>
        <p style={{ fontSize: "12px", color: c.textSec, textAlign: "center", marginTop: "24px" }}>{t("adminHint")}</p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// PRODUCT CARD
// ════════════════════════════════════════
const ProductCard = ({ product: p, onView, onToggleWatchlist, isWatched }) => {
  const c = useColors();
  const t = useT();
  const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0;
  return (
    <div onClick={() => onView(p)} style={{ background: c.cardBg, borderRadius: "18px", overflow: "hidden", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.25,0.1,0.25,1)", border: `1px solid ${c.border}`, position: "relative" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; }} onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; }}>
      <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, display: "flex", gap: "6px" }}>
        {discount > 0 && <span style={{ background: "#ff3b30", color: "#fff", padding: "4px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600" }}>-{discount}%</span>}
        {p.free_shipping && <span style={{ background: "rgba(0,113,227,0.9)", color: "#fff", padding: "4px 10px", borderRadius: "50px", fontSize: "11px", fontWeight: "600" }}>{t("freeShipping")}</span>}
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleWatchlist?.(p.id); }} style={{ position: "absolute", top: "12px", right: "12px", zIndex: 2, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: isWatched ? "#ff3b30" : "#86868b" }}><I.Heart f={isWatched} /></button>
      <div style={{ height: "180px", display: "flex", alignItems: "center", justifyContent: "center", background: c.pillBg, fontSize: "48px", fontWeight: "700", color: c.textSec }}>{p.emoji_icon || "?"}</div>
      <div style={{ padding: "16px 18px 18px" }}>
        <p style={{ fontSize: "13px", color: c.textSec, fontWeight: "500", marginBottom: "4px" }}>{p.category_name}</p>
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: c.text, margin: "0 0 8px", lineHeight: "1.3", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
          <StarRating rating={parseFloat(p.avg_rating)||0} size={12} />
          <span style={{ fontSize: "12px", color: c.textSec }}>{parseFloat(p.avg_rating||0).toFixed(1)} ({p.review_count||0})</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "20px", fontWeight: "700", color: c.text }}>${parseFloat(p.price).toFixed(2)}</span>
          {p.original_price && <span style={{ fontSize: "14px", color: c.textSec, textDecoration: "line-through" }}>${parseFloat(p.original_price).toFixed(2)}</span>}
        </div>
        <p style={{ fontSize: "12px", color: c.textSec, marginTop: "6px" }}>{p.seller_name} · {p.total_sold} {t("sold")}</p>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// PRODUCT DETAIL
// ════════════════════════════════════════
const ProductDetail = ({ product: p, onBack, onAddToCart, onBuyNow }) => {
  const c = useColors();
  const t = useT();
  const [qty, setQty] = useState(1);
  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "20px 20px 60px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "30px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "start" }}>
        <div style={{ background: c.pillBg, borderRadius: "24px", height: "450px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "100px", fontWeight: "700", color: c.textSec }}>{p.emoji_icon}</div>
        <div>
          <p style={{ fontSize: "14px", color: c.accent, fontWeight: "500", marginBottom: "8px" }}>{p.category_name}</p>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", lineHeight: "1.15", margin: "0 0 12px" }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}><StarRating rating={parseFloat(p.avg_rating)||0} /><span style={{ fontSize: "14px", color: c.textSec }}>{parseFloat(p.avg_rating||0).toFixed(1)} ({p.review_count||0} reviews)</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "12px", marginBottom: "8px" }}>
            <span style={{ fontSize: "36px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em" }}>${parseFloat(p.price).toFixed(2)}</span>
            {p.original_price && <span style={{ fontSize: "20px", color: c.textSec, textDecoration: "line-through" }}>${parseFloat(p.original_price).toFixed(2)}</span>}
          </div>
          {p.original_price && <p style={{ fontSize: "15px", color: "#34c759", fontWeight: "500", marginBottom: "20px" }}>You save ${(p.original_price - p.price).toFixed(2)}</p>}
          <div style={{ padding: "20px 0", borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, marginBottom: "24px" }}>
            <p style={{ fontSize: "15px", color: c.text, lineHeight: "1.6" }}>{p.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
              {[["Condition", p.condition], ["Seller", p.seller_name], ["In Stock", `${p.quantity} units`], ["Shipping", p.free_shipping ? "Free" : "$9.99"]].map(([l,v],i) => <div key={i}><span style={{ fontSize: "12px", color: c.textSec }}>{l}</span><p style={{ fontSize: "14px", color: l==="Shipping"&&p.free_shipping ? "#34c759" : c.text, fontWeight: "500", margin: "2px 0 0" }}>{v}</p></div>)}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <span style={{ fontSize: "14px", color: c.textSec }}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", background: c.pillBg, borderRadius: "10px" }}>
              <button onClick={() => setQty(Math.max(1,qty-1))} style={{ width: "40px", height: "40px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c.text }}><I.Minus /></button>
              <span style={{ width: "40px", textAlign: "center", fontSize: "16px", fontWeight: "600", color: c.text }}>{qty}</span>
              <button onClick={() => setQty(Math.min(p.quantity, qty+1))} style={{ width: "40px", height: "40px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c.text }}><I.Plus /></button>
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Btn full onClick={() => onAddToCart(p, qty)}>{t("addToBag")}</Btn>
            <Btn variant="outline" onClick={() => onBuyNow(p, qty)} style={{ flex: "0 0 auto", padding: "14px 28px" }}>{t("buyNow")}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// CHECKOUT PAGE
// ════════════════════════════════════════
const CheckoutPage = ({ items, onBack, token, user, refreshUser, onComplete, onGoWallet }) => {
  const c = useColors();
  const t = useT();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("wallet");
  const [selectedCard, setSelectedCard] = useState(null);
  const [cards, setCards] = useState([]);
  const [address, setAddress] = useState({ line1: "", city: "", zip: "", country: "" });
  const [phone, setPhone] = useState("");
  const [error, setError] = useState(""); const [processing, setProcessing] = useState(false); const [orderResult, setOrderResult] = useState(null);

  useEffect(() => { if (token) api.get("/wallet/cards", token).then(setCards).catch(() => {}); }, [token]);

  const subtotal = items.reduce((s,i) => s + parseFloat(i.price) * (i.qty||1), 0);
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  const handlePay = async () => {
    setError("");
    if (step === 1) {
      if (!address.line1 || !address.city || !address.zip) return setError("Please fill in your shipping address.");
      if (!phone || phone.length < 8) return setError("Please enter a valid contact number.");
      setStep(2); return;
    }
    if (payMethod === "wallet" && parseFloat(user.wallet_balance) < total) return setError("Insufficient wallet balance. Top up or pay with card.");
    if (payMethod === "card" && !selectedCard) return setError("Please select a card.");
    setProcessing(true);
    try {
      const orderData = {
        items: items.map(i => ({ product_id: i.id, quantity: i.qty || 1 })),
        payment_method: payMethod, card_id: payMethod === "card" ? selectedCard : undefined,
        contact_phone: phone,
        ship_address: address.line1, ship_city: address.city, ship_zip: address.zip, ship_country: address.country,
      };
      const order = await api.post("/orders", orderData, token);
      await refreshUser();
      setOrderResult(order);
    } catch (err) { setError(err.message); }
    finally { setProcessing(false); }
  };

  if (orderResult) {
    return (
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#34c75920", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#34c759" }}><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg></div>
        <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "8px" }}>{t("orderConfirmed")}</h1>
        <p style={{ fontSize: "17px", color: c.textSec, marginBottom: "32px" }}>{t("thankYouPurchase")}</p>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}`, textAlign: "left", marginBottom: "24px" }}>
          {[["Order ID", orderResult.order_number],["Total", `$${parseFloat(orderResult.total).toFixed(2)}`],["Payment", orderResult.payment_method],["Phone", orderResult.contact_phone],["Ship to", `${orderResult.ship_address}, ${orderResult.ship_city} ${orderResult.ship_zip}`]].map(([l,v],i) =>
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${c.border}` : "none" }}><span style={{ color: c.textSec, fontSize: "14px" }}>{l}</span><span style={{ color: c.text, fontWeight: "500", fontSize: "14px" }}>{v}</span></div>
          )}
        </div>
        <Btn full onClick={onComplete}>{t("continueShopping")}</Btn>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "8px" }}>{t("checkout")}</h1>
      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        {[{n:1,l:"Shipping & Contact"},{n:2,l:"Payment"}].map((s,i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: step >= s.n ? c.accent : c.pillBg, color: step >= s.n ? "#fff" : c.textSec, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600" }}>{step > s.n ? <I.Check /> : s.n}</div>
            <span style={{ fontSize: "14px", fontWeight: "500", color: step >= s.n ? c.text : c.textSec }}>{s.l}</span>
            {i < 1 && <div style={{ width: "40px", height: "1px", background: c.border }} />}
          </div>
        ))}
      </div>
      {error && <div style={{ background: "#ff3b3014", border: "1px solid #ff3b3044", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "14px", color: "#ff3b30", fontWeight: "500" }}>{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px", alignItems: "start" }}>
        <div>
          {step === 1 && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("shippingAddress")}</h3>
            <Input label={t("address")} value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="123 Apple Street, #04-56" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input label={t("city")} value={address.city} onChange={e => setAddress({...address, city: e.target.value})} placeholder="Singapore" />
              <Input label={t("postalCode")} value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} placeholder="123456" />
            </div>
            <Input label={t("country")} value={address.country} onChange={e => setAddress({...address, country: e.target.value})} placeholder="Singapore" />
            <div style={{ borderTop: `1px solid ${c.border}`, marginTop: "8px", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("contactInfo")}</h3>
              <Input label={t("phoneNumber")} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+65 9123 4567" />
              <p style={{ fontSize: "12px", color: c.textSec }}>{t("deliveryUpdates")}</p>
            </div>
          </div>}
          {step === 2 && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("paymentMethod")}</h3>
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
              {[{id:"wallet",l:"Wallet",sub:`Balance: $${parseFloat(user.wallet_balance).toFixed(2)}`,icon:<I.Wallet />},{id:"card",l:"Pay with Card",sub: cards.length > 0 ? `${cards.length} card${cards.length>1?"s":""} saved` : "No cards yet",icon:<I.CreditCard />}].map(m => (
                <button key={m.id} onClick={() => { setPayMethod(m.id); setError(""); }} style={{ flex: 1, padding: "18px", borderRadius: "14px", border: `1.5px solid ${payMethod===m.id ? c.accent : c.border}`, background: payMethod===m.id ? c.accent+"10" : "transparent", cursor: "pointer", textAlign: "left" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", color: payMethod===m.id ? c.accent : c.text }}>{m.icon}<span style={{ fontWeight: "600", fontSize: "15px" }}>{m.l}</span></div>
                  <span style={{ fontSize: "13px", color: c.textSec }}>{m.sub}</span>
                </button>
              ))}
            </div>
            {payMethod === "wallet" && <div style={{ background: c.pillBg, borderRadius: "14px", padding: "28px", textAlign: "center" }}>
              <div style={{ fontSize: "36px", fontWeight: "700", color: c.text }}>${parseFloat(user.wallet_balance).toFixed(2)}</div>
              {parseFloat(user.wallet_balance) >= total ?
                <p style={{ fontSize: "14px", color: "#34c759", marginTop: "8px", fontWeight: "500" }}>After purchase: ${(parseFloat(user.wallet_balance) - total).toFixed(2)}</p> :
                <div style={{ marginTop: "12px" }}><p style={{ fontSize: "14px", color: "#ff3b30", fontWeight: "500", marginBottom: "12px" }}>Need ${(total - parseFloat(user.wallet_balance)).toFixed(2)} more</p><Btn variant="outline" onClick={onGoWallet} style={{ fontSize: "14px", padding: "10px 20px" }}>Top Up Wallet</Btn></div>
              }
            </div>}
            {payMethod === "card" && <div>
              {cards.length === 0 ? <div style={{ textAlign: "center", padding: "24px" }}><p style={{ color: c.textSec, marginBottom: "12px" }}>No cards saved. Add one in your Wallet page.</p><Btn variant="outline" onClick={onGoWallet}>Go to Wallet</Btn></div> :
                cards.map(cd => <button key={cd.id} onClick={() => setSelectedCard(selectedCard===cd.id ? null : cd.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${selectedCard===cd.id ? c.accent : c.border}`, background: selectedCard===cd.id ? c.accent+"10" : "transparent", cursor: "pointer", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><I.CreditCard /><span style={{ fontSize: "14px", fontWeight: "500", color: c.text }}>{cd.masked_number}</span><span style={{ fontSize: "13px", color: c.textSec }}>{cd.cardholder_name}</span></div>
                  {selectedCard===cd.id && <span style={{ color: c.accent }}><I.Check /></span>}
                </button>)
              }
            </div>}
          </div>}
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}`, position: "sticky", top: "80px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("orderSummary")}</h3>
          {items.map((it,i) => <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "12px", alignItems: "center" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: c.pillBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "700", color: c.textSec, flexShrink: 0 }}>{it.emoji_icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}><p style={{ fontSize: "13px", color: c.text, fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.name}</p><p style={{ fontSize: "12px", color: c.textSec }}>Qty: {it.qty||1}</p></div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>${(parseFloat(it.price)*(it.qty||1)).toFixed(2)}</span>
          </div>)}
          <div style={{ borderTop: `1px solid ${c.border}`, marginTop: "8px", paddingTop: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: c.textSec }}>{t("subtotal")}</span><span style={{ color: c.text }}>${subtotal.toFixed(2)}</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: c.textSec }}>Shipping</span><span style={{ color: "#34c759" }}>Free</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}><span style={{ color: c.textSec }}>Tax (8%)</span><span style={{ color: c.text }}>${tax.toFixed(2)}</span></div>
            <div style={{ borderTop: `1px solid ${c.border}`, marginTop: "8px", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "18px", fontWeight: "600", color: c.text }}>Total</span><span style={{ fontSize: "18px", fontWeight: "700", color: c.text }}>${total.toFixed(2)}</span></div>
          </div>
          <Btn full disabled={processing} onClick={handlePay} style={{ marginTop: "24px", padding: "16px", fontSize: "17px" }}>{processing ? t("processing") : step === 1 ? t("continueToPayment") : `Pay $${total.toFixed(2)}`}</Btn>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// CART PAGE
// ════════════════════════════════════════
const CartPage = ({ cart, onUpdateQty, onRemove, onBack, onCheckout }) => {
  const c = useColors();
  const t = useT();
  const total = cart.reduce((s,i) => s + parseFloat(i.price) * i.qty, 0);
  if (cart.length === 0) return <div style={{ maxWidth: "980px", margin: "0 auto", padding: "40px 20px" }}><button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button><h1 style={{ fontSize: "36px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "32px" }}>{t("yourBag")}</h1><div style={{ textAlign: "center", padding: "80px" }}><p style={{ fontSize: "20px", color: c.textSec }}>{t("bagEmpty")}</p></div></div>;
  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", padding: "40px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Continue shopping</button>
      <h1 style={{ fontSize: "36px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "32px" }}>{t("yourBag")}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "40px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {cart.map(item => <div key={item.id} style={{ display: "flex", gap: "20px", padding: "20px", background: c.cardBg, borderRadius: "16px", border: `1px solid ${c.border}` }}>
            <div style={{ width: "90px", height: "90px", borderRadius: "12px", background: c.pillBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", fontWeight: "700", color: c.textSec, flexShrink: 0 }}>{item.emoji_icon}</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "15px", fontWeight: "600", color: c.text, margin: "0 0 4px" }}>{item.name}</h3>
              <p style={{ fontSize: "13px", color: c.textSec, margin: "0 0 12px" }}>{item.seller_name}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", background: c.pillBg, borderRadius: "8px" }}>
                  <button onClick={() => onUpdateQty(item.id, item.qty-1)} style={{ width: "32px", height: "32px", border: "none", background: "transparent", cursor: "pointer", color: c.text, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Minus /></button>
                  <span style={{ width: "28px", textAlign: "center", fontSize: "14px", fontWeight: "600", color: c.text }}>{item.qty}</span>
                  <button onClick={() => onUpdateQty(item.id, item.qty+1)} style={{ width: "32px", height: "32px", border: "none", background: "transparent", cursor: "pointer", color: c.text, display: "flex", alignItems: "center", justifyContent: "center" }}><I.Plus /></button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}><span style={{ fontSize: "17px", fontWeight: "600", color: c.text }}>${(parseFloat(item.price)*item.qty).toFixed(2)}</span><button onClick={() => onRemove(item.id)} style={{ background: "none", border: "none", cursor: "pointer", color: c.textSec }}><I.Trash /></button></div>
              </div>
            </div>
          </div>)}
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}`, position: "sticky", top: "80px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("orderSummary")}</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}><span style={{ color: c.textSec }}>{t("subtotal")}</span><span style={{ color: c.text, fontWeight: "500" }}>${total.toFixed(2)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}><span style={{ color: c.textSec }}>Tax (8%)</span><span style={{ color: c.text, fontWeight: "500" }}>${(total*0.08).toFixed(2)}</span></div>
          <div style={{ borderTop: `1px solid ${c.border}`, marginTop: "16px", paddingTop: "16px", display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: "18px", fontWeight: "600", color: c.text }}>Total</span><span style={{ fontSize: "18px", fontWeight: "700", color: c.text }}>${(total*1.08).toFixed(2)}</span></div>
          <Btn full onClick={onCheckout} style={{ marginTop: "24px", padding: "16px", fontSize: "17px" }}>{t("checkout")}</Btn>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// ORDERS PAGE (with cancel + detailed info)
// ════════════════════════════════════════
const OrdersPage = ({ token, onBack }) => {
  const c = useColors();
  const t = useT();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true);
  const [cancelOrderId, setCancelOrderId] = useState(null); const [cancelReason, setCancelReason] = useState(""); const [cancelError, setCancelError] = useState("");
  const [expandedOrder, setExpandedOrder] = useState(null);

  const load = () => { api.get("/orders", token).then(setOrders).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, []);

  const handleCancel = async (orderId) => {
    setCancelError("");
    if (!cancelReason.trim()) return setCancelError("Please provide a reason.");
    try {
      await api.post(`/orders/${orderId}/cancel`, { reason: cancelReason }, token);
      setCancelOrderId(null); setCancelReason("");
      load();
    } catch (err) { setCancelError(err.message); }
  };

  const statusColor = s => ({ Processing: c.accent, Confirmed: "#34c759", Shipped: "#007aff", Delivered: "#34c759", "Cancel Requested": "#ff9f0a", Cancelled: "#ff3b30", Refunded: "#ff3b30" }[s] || c.textSec);

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "32px" }}>{t("myOrders")}</h1>
      {loading ? <div style={{ textAlign: "center", padding: "60px" }}><Spinner /></div> : orders.length === 0 ? <div style={{ textAlign: "center", padding: "80px" }}><div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div><p style={{ fontSize: "18px", color: c.textSec }}>{t("noOrdersYet")}</p></div> :
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orders.map(o => {
            const expanded = expandedOrder === o.id;
            const canCancel = ["Processing", "Confirmed"].includes(o.status);
            const cr = o.cancel_request;
            return (
              <div key={o.id} style={{ background: c.cardBg, borderRadius: "18px", border: `1px solid ${c.border}`, overflow: "hidden" }}>
                {/* Order header */}
                <div onClick={() => setExpandedOrder(expanded ? null : o.id)} style={{ padding: "20px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div><span style={{ fontSize: "16px", fontWeight: "600", color: c.text }}>{o.order_number}</span><p style={{ fontSize: "13px", color: c.textSec, marginTop: "2px" }}>{new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p></div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "17px", fontWeight: "600", color: c.text }}>${parseFloat(o.total).toFixed(2)}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: statusColor(o.status), background: statusColor(o.status) + "18", padding: "5px 14px", borderRadius: "50px" }}>{o.status}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.textSec} strokeWidth="2" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${c.border}` }}>
                  {/* Items */}
                  <div style={{ padding: "16px 0" }}>
                    {o.items?.map((it,j) => <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: c.pillBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: c.textSec }}>{it.emoji_icon}</div>
                        <div><p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{it.name}</p><p style={{ fontSize: "12px", color: c.textSec }}>from {it.seller_name} · Qty: {it.quantity}</p></div>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>${parseFloat(it.subtotal).toFixed(2)}</span>
                    </div>)}
                  </div>

                  {/* Order details grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "16px 0", borderTop: `1px solid ${c.border}` }}>
                    <div style={{ background: c.pillBg, borderRadius: "12px", padding: "16px" }}>
                      <p style={{ fontSize: "12px", color: c.textSec, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Shipping Address</p>
                      <p style={{ fontSize: "14px", color: c.text, lineHeight: "1.5" }}>{o.ship_address || "N/A"}<br/>{o.ship_city} {o.ship_zip}<br/>{o.ship_country}</p>
                    </div>
                    <div style={{ background: c.pillBg, borderRadius: "12px", padding: "16px" }}>
                      <p style={{ fontSize: "12px", color: c.textSec, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Payment & Contact</p>
                      <p style={{ fontSize: "14px", color: c.text, lineHeight: "1.5" }}>
                        {o.payment_method}<br/>
                        Phone: {o.contact_phone || "N/A"}<br/>
                        Tax: ${parseFloat(o.tax).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Cancel request status */}
                  {cr && cr.status && <div style={{ marginTop: "12px", padding: "16px", borderRadius: "12px", background: cr.status === "approved" ? "#34c75910" : cr.status === "rejected" ? "#ff3b3010" : "#ff9f0a10", border: `1px solid ${cr.status === "approved" ? "#34c75930" : cr.status === "rejected" ? "#ff3b3030" : "#ff9f0a30"}` }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: cr.status === "approved" ? "#34c759" : cr.status === "rejected" ? "#ff3b30" : "#ff9f0a" }}>Cancel request: {cr.status}</p>
                    <p style={{ fontSize: "13px", color: c.textSec, marginTop: "4px" }}>Reason: {cr.reason}</p>
                    {cr.seller_response && <p style={{ fontSize: "13px", color: c.textSec, marginTop: "4px" }}>Seller response: {cr.seller_response}</p>}
                  </div>}

                  {/* Cancel button */}
                  {canCancel && !cr && cancelOrderId !== o.id && <div style={{ marginTop: "16px" }}>
                    <button onClick={() => setCancelOrderId(o.id)} style={{ background: "none", border: `1px solid #ff3b30`, color: "#ff3b30", padding: "10px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>{t("requestCancellation")}</button>
                  </div>}

                  {/* Cancel form */}
                  {cancelOrderId === o.id && <div style={{ marginTop: "16px", padding: "20px", background: c.pillBg, borderRadius: "14px" }}>
                    <p style={{ fontSize: "15px", fontWeight: "600", color: c.text, marginBottom: "12px" }}>{t("whyCancelQ")}</p>
                    {cancelError && <p style={{ fontSize: "13px", color: "#ff3b30", marginBottom: "8px" }}>{cancelError}</p>}
                    <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Please explain your reason..." rows={3} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: `1px solid ${c.border}`, background: c.cardBg, color: c.text, fontSize: "14px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                    <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                      <Btn onClick={() => handleCancel(o.id)} style={{ background: "#ff3b30", padding: "10px 20px", fontSize: "14px" }}>{t("submitRequest")}</Btn>
                      <Btn variant="outline" onClick={() => { setCancelOrderId(null); setCancelReason(""); setCancelError(""); }} style={{ padding: "10px 20px", fontSize: "14px" }}>{t("neverMind")}</Btn>
                    </div>
                  </div>}
                </div>}
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};

// ════════════════════════════════════════
// ADMIN DASHBOARD (real DB data)
// ════════════════════════════════════════
const AdminDashboard = ({ token }) => {
  const c = useColors();
  const t = useT();
  const [tab, setTab] = useState("metrics"); const [stats, setStats] = useState(null); const [users, setUsers] = useState([]); const [finance, setFinance] = useState(null); const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/admin/stats", token).then(setStats).catch(() => {});
    api.get("/admin/users", token).then(d => setUsers(d.users)).catch(() => {});
    api.get("/admin/finance", token).then(setFinance).catch(() => {});
    api.get("/admin/orders", token).then(setOrders).catch(() => {});
  }, []);

  const tabs = [{id:"metrics",l:"Metrics",i:<I.BarChart />},{id:"users",l:"Users",i:<I.Users />},{id:"finance",l:"Finance",i:<I.DollarSign />},{id:"orders",l:"Orders",i:<I.FileText />}];
  const p = stats?.platform || {};

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", margin: "0 0 32px" }}>{t("adminPanel")}</h1>
      <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: c.pillBg, borderRadius: "12px", padding: "4px", overflowX: "auto" }}>
        {tabs.map(tb => <button key={tb.id} onClick={() => setTab(tb.id)} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "8px", border: "none", background: tab===tb.id ? c.tabActive : "transparent", color: tab===tb.id ? c.text : c.textSec, fontWeight: "500", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", boxShadow: tab===tb.id ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{tb.i} {tb.l}</button>)}
      </div>

      {tab === "metrics" && <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[["Total Users", p.total_users, `${p.total_buyers||0} buyers, ${p.total_sellers||0} sellers`],["Active Listings", p.active_listings, "Products"],["Total Orders", p.total_orders, `${p.pending_orders||0} pending`],["Revenue", `$${parseFloat(p.total_revenue||0).toFixed(2)}`, `${p.orders_this_week||0} orders this week`]].map(([l,v,s],i) => (
          <div key={i} style={{ background: c.cardBg, borderRadius: "18px", padding: "24px", border: `1px solid ${c.border}` }}>
            <span style={{ fontSize: "14px", color: c.textSec, fontWeight: "500" }}>{l}</span>
            <div style={{ fontSize: "28px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", margin: "8px 0 4px" }}>{v || 0}</div>
            <span style={{ fontSize: "13px", color: "#34c759", fontWeight: "500" }}>{s}</span>
          </div>
        ))}
      </div>}

      {tab === "users" && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>All Users ({users.length})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Name","Email","Role","Wallet","Status","Joined"].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 16px", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", borderBottom: `1px solid ${c.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{users.map(u => <tr key={u.id} style={{ borderBottom: `1px solid ${c.border}` }}>
            <td style={{ padding: "14px 16px", fontSize: "14px", color: c.text, fontWeight: "500" }}>{u.name}</td>
            <td style={{ padding: "14px 16px", fontSize: "14px", color: c.textSec }}>{u.email}</td>
            <td style={{ padding: "14px 16px" }}><span style={{ fontSize: "12px", fontWeight: "500", color: u.role==="admin" ? "#ff3b30" : u.role==="seller" ? c.accent : c.textSec, textTransform: "capitalize" }}>{u.role}</span></td>
            <td style={{ padding: "14px 16px", fontSize: "14px", color: c.text, fontWeight: "500" }}>${parseFloat(u.wallet_balance).toFixed(2)}</td>
            <td style={{ padding: "14px 16px" }}><span style={{ fontSize: "12px", fontWeight: "600", color: u.is_active ? "#34c759" : "#ff3b30", background: (u.is_active ? "#34c759" : "#ff3b30")+"18", padding: "4px 12px", borderRadius: "50px" }}>{u.is_active ? "Active" : "Suspended"}</span></td>
            <td style={{ padding: "14px 16px", fontSize: "14px", color: c.textSec }}>{new Date(u.created_at).toLocaleDateString()}</td>
          </tr>)}</tbody>
        </table>
      </div>}

      {tab === "finance" && finance && <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[["Total Revenue", `$${parseFloat(finance.summary.total_revenue||0).toFixed(2)}`],["Platform Fees (5%)", `$${parseFloat(finance.summary.platform_fees||0).toFixed(2)}`],["Total Tax", `$${parseFloat(finance.summary.total_tax||0).toFixed(2)}`],["Total Orders", finance.summary.total_orders]].map(([l,v],i) => (
            <div key={i} style={{ background: c.cardBg, borderRadius: "18px", padding: "24px", border: `1px solid ${c.border}` }}>
              <span style={{ fontSize: "14px", color: c.textSec }}>{l}</span>
              <div style={{ fontSize: "24px", fontWeight: "700", color: c.text, marginTop: "8px" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("revenueBySeller")}</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Store","Seller","Gross Sales","Platform Fee","Net to Seller","Wallet Balance","Orders"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", borderBottom: `1px solid ${c.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{finance.by_seller.map((s,i) => <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
              <td style={{ padding: "12px", fontSize: "14px", color: c.text, fontWeight: "500" }}>{s.store_name}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: c.textSec }}>{s.seller_name}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: c.text }}>${parseFloat(s.gross_sales).toFixed(2)}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: "#ff9f0a" }}>${parseFloat(s.platform_fee).toFixed(2)}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: "#34c759" }}>${parseFloat(s.net_to_seller).toFixed(2)}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: c.text, fontWeight: "500" }}>${parseFloat(s.wallet_balance).toFixed(2)}</td>
              <td style={{ padding: "12px", fontSize: "14px", color: c.text }}>{s.order_count}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("revenueByCategory")}</h3>
          {finance.by_category.map((cat,i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}><span style={{ color: c.text }}>{cat.category}</span><span style={{ fontWeight: "600", color: c.text }}>${parseFloat(cat.revenue).toFixed(2)} ({cat.order_count} orders)</span></div>)}
        </div>
      </div>}

      {tab === "orders" && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>All Orders ({orders.length})</h3>
        {orders.length === 0 ? <p style={{ color: c.textSec, textAlign: "center", padding: "40px" }}>{t("noOrdersYet")}</p> :
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>{["Order","Buyer","Total","Status","Payment","Date"].map(h => <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", borderBottom: `1px solid ${c.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{orders.map(o => <tr key={o.id} style={{ borderBottom: `1px solid ${c.border}` }}>
              <td style={{ padding: "14px", fontSize: "14px", color: c.accent, fontWeight: "500" }}>{o.order_number}</td>
              <td style={{ padding: "14px", fontSize: "14px", color: c.text }}>{o.buyer_name}</td>
              <td style={{ padding: "14px", fontSize: "14px", color: c.text, fontWeight: "600" }}>${parseFloat(o.total).toFixed(2)}</td>
              <td style={{ padding: "14px" }}><span style={{ fontSize: "12px", fontWeight: "600", color: "#34c759", background: "#34c75918", padding: "4px 12px", borderRadius: "50px" }}>{o.status}</span></td>
              <td style={{ padding: "14px", fontSize: "14px", color: c.textSec }}>{o.payment_method}</td>
              <td style={{ padding: "14px", fontSize: "14px", color: c.textSec }}>{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>)}</tbody>
          </table>
        }
      </div>}
    </div>
  );
};

// ════════════════════════════════════════
// SETTINGS
// ════════════════════════════════════════
const SettingsPage = ({ user, onBack }) => {
  const { theme, setTheme, accentColor, setAccentColor } = useTheme();
  const c = useColors();
  const t = useT();
  const [tab, setTab] = useState("appearance");
  const accents = [{n:"Blue"},{n:"Purple"},{n:"Green"},{n:"Orange"},{n:"Pink"},{n:"Red"}];
  const accentVals = { Blue:["#0071e3","#0a84ff"], Purple:["#6e3adb","#bf5af2"], Green:["#248a3d","#30d158"], Orange:["#c93400","#ff9f0a"], Pink:["#d4317f","#ff375f"], Red:["#d70015","#ff453a"] };
  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "32px" }}>{t("settings")}</h1>
      <div style={{ display: "flex", gap: "4px", marginBottom: "32px", background: c.pillBg, borderRadius: "12px", padding: "4px" }}>
        {["appearance","account"].map(tabId => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: tab===t ? c.tabActive : "transparent", color: tab===t ? c.text : c.textSec, fontWeight: "500", fontSize: "14px", cursor: "pointer", textTransform: "capitalize", boxShadow: tab===t ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{t}</button>)}
      </div>
      {tab === "appearance" && <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("theme")}</h3>
          <div style={{ display: "flex", gap: "12px" }}>
            {[{id:"light",l:"Light",i:<I.Sun />},{id:"dark",l:"Dark",i:<I.Moon />}].map(tb => <button key={tb.id} onClick={() => setTheme(tb.id)} style={{ flex: 1, padding: "20px", borderRadius: "14px", border: `2px solid ${theme===tb.id ? c.accent : c.border}`, background: tb.id==="dark" ? "#1a1a1a" : "#f5f5f7", color: tb.id==="dark" ? "#f5f5f7" : "#1d1d1f", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>{tb.i}{tb.l}</button>)}
          </div>
        </div>
        <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("accentColor")}</h3>
          <div style={{ display: "flex", gap: "16px" }}>
            {accents.map(a => <button key={a.n} onClick={() => setAccentColor(a.n.toLowerCase())} style={{ width: "48px", height: "48px", borderRadius: "50%", background: theme==="dark" ? accentVals[a.n][1] : accentVals[a.n][0], border: accentColor===a.n.toLowerCase() ? `3px solid ${c.text}` : "3px solid transparent", cursor: "pointer", outline: accentColor===a.n.toLowerCase() ? `2px solid ${theme==="dark"?accentVals[a.n][1]:accentVals[a.n][0]}` : "none", outlineOffset: "2px" }} />)}
          </div>
        </div>
      </div>}
      {tab === "account" && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 24px" }}>{t("accountDetails")}</h3>
        {[["Name", user.name],["Email", user.email],["Role", user.role],["Wallet", `$${parseFloat(user.wallet_balance).toFixed(2)}`],["Member Since", new Date(user.created_at).toLocaleDateString()]].map(([l,v],i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${c.border}` }}><span style={{ fontSize: "14px", color: c.textSec }}>{l}</span><span style={{ fontSize: "14px", color: c.text, fontWeight: "500", textTransform: l==="Role" ? "capitalize" : "none" }}>{v}</span></div>)}
      </div>}
    </div>
  );
};

// ════════════════════════════════════════
// WALLET PAGE (top-up, transactions, cards)
// ════════════════════════════════════════
const WalletPage = ({ token, user, refreshUser, onBack }) => {
  const c = useColors();
  const t = useT();
  const [tab, setTab] = useState("overview");
  const [cards, setCards] = useState([]); const [transactions, setTransactions] = useState([]);
  const [topupAmount, setTopupAmount] = useState(""); const [selectedCard, setSelectedCard] = useState(null);
  const [cardNum, setCardNum] = useState(""); const [cardName, setCardName] = useState(""); const [cardExp, setCardExp] = useState("");
  const [showAddCard, setShowAddCard] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const [c, t] = await Promise.all([api.get("/wallet/cards", token), api.get("/wallet/transactions", token)]);
      setCards(c); setTransactions(t);
    } catch (err) { console.error(err); }
  };
  useEffect(() => { load(); }, []);

  const handleAddCard = async () => {
    setError("");
    const raw = cardNum.replace(/\s/g, "");
    if (raw.length !== 16) return setError("Card number must be 16 digits.");
    if (!cardName || !cardExp) return setError("Fill all card fields.");
    try {
      await api.post("/wallet/cards", { card_number: raw, cardholder_name: cardName, expiry: cardExp }, token);
      setCardNum(""); setCardName(""); setCardExp(""); setShowAddCard(false);
      await load();
      setSuccess("Card added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.message); }
  };

  const handleTopup = async () => {
    setError("");
    const amt = parseFloat(topupAmount);
    if (!selectedCard) return setError("Please select a card.");
    if (!amt || amt <= 0) return setError("Enter a valid amount.");
    if (amt > 10000) return setError("Maximum $10,000 per top-up.");
    setLoading(true);
    try {
      const res = await api.post("/wallet/topup", { card_id: selectedCard, amount: amt }, token);
      await refreshUser(); await load();
      setTopupAmount(""); setSuccess(res.message);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const formatCard = v => v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
  const formatExp = v => { const n = v.replace(/\D/g,"").slice(0,4); return n.length > 2 ? n.slice(0,2)+"/"+n.slice(2) : n; };
  const txColor = t => t === "topup" || t === "sale_credit" ? "#34c759" : t === "platform_fee" ? "#ff9f0a" : "#ff3b30";
  const txSign = t => t === "topup" || t === "sale_credit" ? "+" : "-";

  return (
    <div style={{ maxWidth: "760px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "8px" }}>{t("wallet")}</h1>

      {/* Balance Card */}
      <div style={{ background: `linear-gradient(135deg, ${c.accent}, ${c.accent}cc)`, borderRadius: "20px", padding: "32px", marginBottom: "28px", color: "#fff" }}>
        <p style={{ fontSize: "14px", opacity: 0.8, marginBottom: "4px" }}>{t("availableBalance")}</p>
        <div style={{ fontSize: "42px", fontWeight: "700", letterSpacing: "-0.03em" }}>${parseFloat(user.wallet_balance).toFixed(2)}</div>
        <p style={{ fontSize: "13px", opacity: 0.7, marginTop: "8px" }}>{cards.length} card{cards.length !== 1 ? "s" : ""} linked</p>
      </div>

      {success && <div style={{ background: "#34c75914", border: "1px solid #34c75944", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: "#34c759", fontWeight: "500" }}>{success}</div>}
      {error && <div style={{ background: "#ff3b3014", border: "1px solid #ff3b3044", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: "#ff3b30", fontWeight: "500" }}>{error}</div>}

      <div style={{ display: "flex", gap: "4px", marginBottom: "28px", background: c.pillBg, borderRadius: "12px", padding: "4px" }}>
        {["overview","topup","cards","history"].map(tb => <button key={tb} onClick={() => { setTab(tb); setError(""); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: tab===tb ? c.tabActive : "transparent", color: tab===tb ? c.text : c.textSec, fontWeight: "500", fontSize: "14px", cursor: "pointer", textTransform: "capitalize", boxShadow: tab===tb ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>{tb}</button>)}
      </div>

      {tab === "overview" && <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div style={{ background: c.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${c.border}` }}>
            <p style={{ fontSize: "13px", color: c.textSec, marginBottom: "8px" }}>{t("totalDeposited")}</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#34c759" }}>${transactions.filter(t => t.type === "topup").reduce((s, t) => s + parseFloat(t.amount), 0).toFixed(2)}</p>
          </div>
          <div style={{ background: c.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${c.border}` }}>
            <p style={{ fontSize: "13px", color: c.textSec, marginBottom: "8px" }}>{t("totalSpent")}</p>
            <p style={{ fontSize: "24px", fontWeight: "700", color: "#ff3b30" }}>${Math.abs(transactions.filter(t => t.type === "purchase").reduce((s, t) => s + parseFloat(t.amount), 0)).toFixed(2)}</p>
          </div>
        </div>
        <div style={{ background: c.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${c.border}` }}>
          <h3 style={{ fontSize: "16px", fontWeight: "600", color: c.text, margin: "0 0 16px" }}>{t("recentTransactions")}</h3>
          {transactions.length === 0 ? <p style={{ color: c.textSec, fontSize: "14px" }}>{t("noTransactions")}</p> :
            transactions.slice(0, 5).map(tx => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}>
                <div><p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{tx.description}</p><p style={{ fontSize: "12px", color: c.textSec }}>{new Date(tx.created_at).toLocaleString()}</p></div>
                <div style={{ textAlign: "right" }}><p style={{ fontSize: "15px", fontWeight: "600", color: txColor(tx.type) }}>{parseFloat(tx.amount) >= 0 ? "+" : ""}${parseFloat(tx.amount).toFixed(2)}</p><p style={{ fontSize: "12px", color: c.textSec }}>Bal: ${parseFloat(tx.balance_after).toFixed(2)}</p></div>
              </div>
            ))
          }
        </div>
      </div>}

      {tab === "topup" && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("topUpWalletTitle")}</h3>
        {cards.length === 0 ? <div style={{ textAlign: "center", padding: "32px" }}><p style={{ color: c.textSec, marginBottom: "16px" }}>{t("needCardFirst")}</p><Btn onClick={() => setTab("cards")}>Add a Card</Btn></div> : <>
          <p style={{ fontSize: "13px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Select card</p>
          {cards.map(cd => <button key={cd.id} onClick={() => setSelectedCard(cd.id)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", border: `1.5px solid ${selectedCard===cd.id ? c.accent : c.border}`, background: selectedCard===cd.id ? c.accent+"10" : "transparent", cursor: "pointer", marginBottom: "8px", textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><I.CreditCard /><span style={{ fontSize: "14px", fontWeight: "500", color: c.text }}>{cd.masked_number}</span><span style={{ fontSize: "13px", color: c.textSec }}>{cd.cardholder_name}</span></div>
            {selectedCard===cd.id && <span style={{ color: c.accent }}><I.Check /></span>}
          </button>)}
          <div style={{ marginTop: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Amount</p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[50, 100, 200, 500, 1000, 5000].map(amt => <button key={amt} onClick={() => setTopupAmount(amt.toString())} style={{ padding: "10px 18px", borderRadius: "10px", border: `1.5px solid ${topupAmount===amt.toString() ? c.accent : c.border}`, background: topupAmount===amt.toString() ? c.accent+"10" : "transparent", color: topupAmount===amt.toString() ? c.accent : c.text, fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>${amt}</button>)}
            </div>
            <Input label="Or enter custom amount" type="number" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} placeholder="Enter amount" />
            <Btn full disabled={loading} onClick={handleTopup} style={{ marginTop: "8px" }}>{loading ? t("processing") : `Top Up $${topupAmount || "0"}`}</Btn>
          </div>
        </>}
      </div>}

      {tab === "cards" && <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {cards.map(cd => <div key={cd.id} style={{ background: c.cardBg, borderRadius: "16px", padding: "20px", border: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}><div style={{ width: "48px", height: "34px", borderRadius: "6px", background: c.accent+"20", display: "flex", alignItems: "center", justifyContent: "center", color: c.accent }}><I.CreditCard /></div>
            <div><p style={{ fontSize: "15px", fontWeight: "600", color: c.text }}>{cd.masked_number}</p><p style={{ fontSize: "13px", color: c.textSec }}>{cd.cardholder_name} · Exp {cd.expiry}</p></div>
          </div>
          <div style={{ textAlign: "right" }}><p style={{ fontSize: "13px", color: c.textSec }}>{t("totalToppedUp")}</p><p style={{ fontSize: "15px", fontWeight: "600", color: c.text }}>${parseFloat(cd.total_topped_up||0).toFixed(2)}</p></div>
        </div>)}
        {!showAddCard ? <Btn variant="outline" full onClick={() => setShowAddCard(true)}>{t("addNewCard")}</Btn> :
          <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", color: c.text, margin: "0 0 16px" }}>{t("newCard")}</h3>
            <Input label={t("cardNumber")} value={cardNum} onChange={e => setCardNum(formatCard(e.target.value))} placeholder="1234 5678 9012 3456" style={{ fontFamily: "monospace" }} />
            <Input label={t("cardholderName")} value={cardName} onChange={e => setCardName(e.target.value)} placeholder="John Appleseed" />
            <Input label={t("expiry")} value={cardExp} onChange={e => setCardExp(formatExp(e.target.value))} placeholder="MM/YY" />
            <div style={{ display: "flex", gap: "12px" }}><Btn full onClick={handleAddCard}>Add Card</Btn><Btn variant="outline" onClick={() => setShowAddCard(false)}>Cancel</Btn></div>
            <p style={{ fontSize: "12px", color: c.textSec, marginTop: "12px" }}>{t("anyDigitsWork")}</p>
          </div>
        }
      </div>}

      {tab === "history" && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("allTransactions")}</h3>
        {transactions.length === 0 ? <p style={{ color: c.textSec, textAlign: "center", padding: "40px" }}>{t("noTransactionsYet")}</p> :
          transactions.map(tx => (
            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${c.border}` }}>
              <div><p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{tx.description}</p><p style={{ fontSize: "12px", color: c.textSec }}>{tx.type.replace("_", " ")} · {new Date(tx.created_at).toLocaleString()}</p></div>
              <div style={{ textAlign: "right" }}><p style={{ fontSize: "16px", fontWeight: "600", color: txColor(tx.type) }}>{parseFloat(tx.amount) >= 0 ? "+" : ""}${parseFloat(tx.amount).toFixed(2)}</p><p style={{ fontSize: "12px", color: c.textSec }}>Balance: ${parseFloat(tx.balance_after).toFixed(2)}</p></div>
            </div>
          ))
        }
      </div>}
    </div>
  );
};

// ════════════════════════════════════════
// SELLER EARNINGS PAGE
// ════════════════════════════════════════
const SellerEarningsPage = ({ token, onBack }) => {
  const c = useColors();
  const t = useT();
  const [data, setData] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get("/wallet/seller-earnings", token).then(setData).catch(err => console.error(err)).finally(() => setLoading(false)); }, []);
  if (loading) return <div style={{ textAlign: "center", padding: "80px" }}><Spinner /></div>;
  if (!data) return <div style={{ textAlign: "center", padding: "80px" }}><p style={{ color: c.textSec }}>Could not load earnings data.</p></div>;
  const s = data.summary;

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "8px" }}>{t("earnings")}</h1>
      <p style={{ fontSize: "17px", color: c.textSec, marginBottom: "32px" }}>{s.store_name || "Your Store"}</p>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          ["Gross Sales", `$${parseFloat(s.gross_sales).toFixed(2)}`, c.text],
          ["Commission (5%)", `-$${parseFloat(s.total_commission).toFixed(2)}`, "#ff9f0a"],
          ["Net Earnings", `$${parseFloat(s.net_earnings).toFixed(2)}`, "#34c759"],
          ["Wallet Balance", `$${parseFloat(s.wallet_balance).toFixed(2)}`, c.accent],
        ].map(([l,v,col],i) => <div key={i} style={{ background: c.cardBg, borderRadius: "18px", padding: "24px", border: `1px solid ${c.border}` }}>
          <p style={{ fontSize: "13px", color: c.textSec, marginBottom: "8px" }}>{l}</p>
          <p style={{ fontSize: "24px", fontWeight: "700", color: col, letterSpacing: "-0.02em" }}>{v}</p>
        </div>)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "32px" }}>
        <div style={{ background: c.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${c.border}` }}>
          <p style={{ fontSize: "13px", color: c.textSec }}>{t("totalOrders")}</p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: c.text }}>{s.total_orders}</p>
        </div>
        <div style={{ background: c.cardBg, borderRadius: "16px", padding: "24px", border: `1px solid ${c.border}` }}>
          <p style={{ fontSize: "13px", color: c.textSec }}>{t("itemsSold")}</p>
          <p style={{ fontSize: "28px", fontWeight: "700", color: c.text }}>{s.items_sold}</p>
        </div>
      </div>

      {/* Earnings by Product */}
      {data.by_product.length > 0 && <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}`, marginBottom: "24px" }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("earningsByProduct")}</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr>{["Product","Price","Units Sold","Gross","Commission","Net Earnings"].map(h => <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: c.textSec, textTransform: "uppercase", borderBottom: `1px solid ${c.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{data.by_product.map((p,i) => <tr key={i} style={{ borderBottom: `1px solid ${c.border}` }}>
            <td style={{ padding: "12px", fontSize: "14px", color: c.text, fontWeight: "500" }}>{p.emoji_icon} {p.name}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: c.textSec }}>${parseFloat(p.price).toFixed(2)}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: c.text }}>{p.units_sold}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: c.text }}>${parseFloat(p.gross_revenue).toFixed(2)}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: "#ff9f0a" }}>-${parseFloat(p.commission_paid).toFixed(2)}</td>
            <td style={{ padding: "12px", fontSize: "14px", color: "#34c759", fontWeight: "600" }}>${parseFloat(p.net_revenue).toFixed(2)}</td>
          </tr>)}</tbody>
        </table>
      </div>}

      {/* Recent Transactions */}
      <div style={{ background: c.cardBg, borderRadius: "18px", padding: "28px", border: `1px solid ${c.border}` }}>
        <h3 style={{ fontSize: "18px", fontWeight: "600", color: c.text, margin: "0 0 20px" }}>{t("recentTransactions")}</h3>
        {data.transactions.length === 0 ? <p style={{ color: c.textSec, textAlign: "center", padding: "32px" }}>No transactions yet. Earnings appear here when buyers purchase your products.</p> :
          data.transactions.map(tx => (
            <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}>
              <div><p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{tx.description}</p><p style={{ fontSize: "12px", color: c.textSec }}>{tx.type.replace("_"," ")} · {new Date(tx.created_at).toLocaleString()}</p></div>
              <p style={{ fontSize: "15px", fontWeight: "600", color: parseFloat(tx.amount) >= 0 ? "#34c759" : "#ff9f0a" }}>{parseFloat(tx.amount) >= 0 ? "+" : ""}${parseFloat(tx.amount).toFixed(2)}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
};

// ════════════════════════════════════════
// SELLER ORDERS PAGE (manage orders, approve/reject cancels, update status)
// ════════════════════════════════════════
const SellerOrdersPage = ({ token, onBack }) => {
  const c = useColors();
  const t = useT();
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [respondingTo, setRespondingTo] = useState(null); const [sellerResponse, setSellerResponse] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const load = () => { api.get("/orders/seller", token).then(data => {
    // deduplicate by order id
    const seen = new Set(); const unique = [];
    data.forEach(o => { if (!seen.has(o.id)) { seen.add(o.id); unique.push(o); } });
    setOrders(unique);
  }).catch(err => console.error(err)).finally(() => setLoading(false)); };
  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const handleStatusUpdate = async (orderId, status) => {
    setActionLoading(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status }, token);
      setToast({ msg: `Order updated to ${status}`, type: "success" });
      load();
    } catch (err) { setToast({ msg: err.message, type: "error" }); }
    finally { setActionLoading(null); }
  };

  const handleCancelRespond = async (orderId, action) => {
    setActionLoading(orderId);
    try {
      const res = await api.post(`/orders/${orderId}/cancel-respond`, { action, response: sellerResponse }, token);
      setToast({ msg: res.message, type: "success" });
      setRespondingTo(null); setSellerResponse("");
      load();
    } catch (err) { setToast({ msg: err.message, type: "error" }); }
    finally { setActionLoading(null); }
  };

  const statusColor = s => ({ Processing: c.accent, Confirmed: "#007aff", Shipped: "#5856d6", Delivered: "#34c759", "Cancel Requested": "#ff9f0a", Cancelled: "#ff3b30", Refunded: "#8e8e93" }[s] || c.textSec);
  const nextStatus = s => ({ Processing: "Confirmed", Confirmed: "Shipped", Shipped: "Delivered" }[s]);
  const nextLabel = s => ({ Processing: "Confirm Order", Confirmed: t("markShipped"), Shipped: t("markDelivered") }[s]);

  const filtered = filter === "all" ? orders : filter === "cancels" ? orders.filter(o => o.status === "Cancel Requested") : orders.filter(o => o.status === filter);
  const cancelCount = orders.filter(o => o.status === "Cancel Requested").length;

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 20px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: c.accent, fontSize: "16px", cursor: "pointer", marginBottom: "10px", fontWeight: "500" }}><I.ArrowLeft /> Back</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", margin: "0 0 4px" }}>{t("incomingOrders")}</h1>
          <p style={{ fontSize: "15px", color: c.textSec }}>{orders.length} total orders{cancelCount > 0 ? ` · ${cancelCount} cancellation request${cancelCount > 1 ? "s" : ""}` : ""}</p>
        </div>
      </div>

      {toast && <div style={{ background: toast.type === "success" ? "#34c75914" : "#ff3b3014", border: `1px solid ${toast.type === "success" ? "#34c75944" : "#ff3b3044"}`, borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "14px", color: toast.type === "success" ? "#34c759" : "#ff3b30", fontWeight: "500", display: "flex", justifyContent: "space-between", alignItems: "center" }}>{toast.msg}<button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "18px" }}>x</button></div>}

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", overflowX: "auto", padding: "4px 0" }}>
        {[{id:"all",l:"All"},{id:"Processing",l:"Processing"},{id:"Confirmed",l:"Confirmed"},{id:"Shipped",l:"Shipped"},{id:"Delivered",l:"Delivered"},{id:"cancels",l:`Cancellations${cancelCount > 0 ? ` (${cancelCount})` : ""}`}].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "8px 18px", borderRadius: "50px", border: `1.5px solid ${filter === f.id ? c.accent : c.border}`, background: filter === f.id ? c.accent + "14" : "transparent", color: filter === f.id ? c.accent : c.textSec, fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }}>{f.l}</button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: "60px" }}><Spinner /></div> :
      filtered.length === 0 ? <div style={{ textAlign: "center", padding: "60px", background: c.cardBg, borderRadius: "18px", border: `1px solid ${c.border}` }}><p style={{ fontSize: "16px", color: c.textSec }}>No orders {filter !== "all" ? `with status "${filter}"` : "yet"}</p></div> :

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {filtered.map(o => {
          const cr = o.cancel_request;
          const hasPendingCancel = cr && cr.status === "pending";
          const isResponding = respondingTo === o.id;
          const isLoading = actionLoading === o.id;

          return (
            <div key={o.id} style={{ background: c.cardBg, borderRadius: "18px", border: `1px solid ${hasPendingCancel ? "#ff9f0a44" : c.border}`, overflow: "hidden", boxShadow: hasPendingCancel ? "0 0 0 1px #ff9f0a22" : "none" }}>
              {/* Cancel alert banner */}
              {hasPendingCancel && (
                <div style={{ background: "#ff9f0a14", padding: "12px 24px", display: "flex", alignItems: "center", gap: "10px", borderBottom: `1px solid #ff9f0a30` }}>
                  <I.AlertTriangle />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#ff9f0a" }}>{t("cancelledByBuyer")}</span>
                </div>
              )}

              {/* Order header */}
              <div style={{ padding: "20px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <span style={{ fontSize: "16px", fontWeight: "600", color: c.text }}>{o.order_number}</span>
                    <span style={{ fontSize: "13px", color: c.textSec, marginLeft: "12px" }}>{new Date(o.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "700", color: c.text }}>${parseFloat(o.total).toFixed(2)}</span>
                    <span style={{ fontSize: "12px", fontWeight: "600", color: statusColor(o.status), background: statusColor(o.status) + "18", padding: "5px 14px", borderRadius: "50px" }}>{o.status}</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ marginBottom: "16px" }}>
                  {(Array.isArray(o.items) ? o.items : []).map((it, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{it.emoji_icon}</span>
                        <div><p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{it.name}</p><p style={{ fontSize: "12px", color: c.textSec }}>Qty: {it.quantity} x ${parseFloat(it.unit_price).toFixed(2)}</p></div>
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>${parseFloat(it.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Buyer info */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "16px 0", borderTop: `1px solid ${c.border}` }}>
                  <div style={{ background: c.pillBg, borderRadius: "12px", padding: "14px" }}>
                    <p style={{ fontSize: "11px", color: c.textSec, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Buyer</p>
                    <p style={{ fontSize: "14px", color: c.text, fontWeight: "500" }}>{o.buyer_name}</p>
                    <p style={{ fontSize: "13px", color: c.textSec }}>{o.buyer_email}</p>
                    {o.contact_phone && <p style={{ fontSize: "13px", color: c.textSec }}>Phone: {o.contact_phone}</p>}
                  </div>
                  <div style={{ background: c.pillBg, borderRadius: "12px", padding: "14px" }}>
                    <p style={{ fontSize: "11px", color: c.textSec, fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Shipping</p>
                    <p style={{ fontSize: "14px", color: c.text, lineHeight: "1.4" }}>{o.ship_address || "N/A"}{o.ship_city ? `, ${o.ship_city}` : ""} {o.ship_zip || ""}</p>
                    <p style={{ fontSize: "13px", color: c.textSec }}>Payment: {o.payment_method}</p>
                  </div>
                </div>

                {/* Cancel request details + approve/reject */}
                {hasPendingCancel && (
                  <div style={{ marginTop: "12px", padding: "20px", borderRadius: "14px", background: "#ff9f0a08", border: "1px solid #ff9f0a22" }}>
                    <p style={{ fontSize: "14px", fontWeight: "600", color: "#ff9f0a", marginBottom: "8px" }}>{t("buyerCancelReason")}</p>
                    <p style={{ fontSize: "14px", color: c.text, marginBottom: "16px", lineHeight: "1.5", fontStyle: "italic" }}>"{cr.reason}"</p>

                    {!isResponding ? (
                      <div style={{ display: "flex", gap: "12px" }}>
                        <button onClick={() => handleCancelRespond(o.id, "approve")} disabled={isLoading} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#34c759", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}>{isLoading ? "..." : "Approve Refund"}</button>
                        <button onClick={() => setRespondingTo(o.id)} style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #ff3b30", background: "transparent", color: "#ff3b30", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>Reject</button>
                      </div>
                    ) : (
                      <div>
                        <p style={{ fontSize: "13px", color: c.textSec, marginBottom: "8px" }}>Explain why you're rejecting (optional):</p>
                        <textarea value={sellerResponse} onChange={e => setSellerResponse(e.target.value)} placeholder="e.g. Item has already been shipped..." rows={2} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${c.border}`, background: c.cardBg, color: c.text, fontSize: "14px", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" }} />
                        <div style={{ display: "flex", gap: "12px" }}>
                          <button onClick={() => handleCancelRespond(o.id, "reject")} disabled={isLoading} style={{ padding: "10px 24px", borderRadius: "10px", border: "none", background: "#ff3b30", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: isLoading ? 0.6 : 1 }}>{isLoading ? "..." : "Confirm Reject"}</button>
                          <button onClick={() => { setRespondingTo(null); setSellerResponse(""); }} style={{ padding: "10px 24px", borderRadius: "10px", border: `1px solid ${c.border}`, background: "transparent", color: c.textSec, fontSize: "14px", cursor: "pointer" }}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status update buttons */}
                {!hasPendingCancel && nextStatus(o.status) && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
                    <Btn onClick={() => handleStatusUpdate(o.id, nextStatus(o.status))} disabled={isLoading} style={{ padding: "10px 24px", fontSize: "14px" }}>
                      {isLoading ? "Updating..." : nextLabel(o.status)}
                    </Btn>
                    {o.status === "Processing" && <p style={{ fontSize: "12px", color: c.textSec }}>{t("confirmPrepare")}</p>}
                    {o.status === "Confirmed" && <p style={{ fontSize: "12px", color: c.textSec }}>{t("handedCourier")}</p>}
                    {o.status === "Shipped" && <p style={{ fontSize: "12px", color: c.textSec }}>{t("buyerReceived")}</p>}
                  </div>
                )}

                {/* Completed/cancelled states */}
                {o.status === "Delivered" && <div style={{ marginTop: "16px", padding: "14px", borderRadius: "10px", background: "#34c75910", display: "flex", alignItems: "center", gap: "10px" }}><I.Check /><span style={{ fontSize: "14px", color: "#34c759", fontWeight: "500" }}>{t("orderCompleted")}</span></div>}
                {o.status === "Refunded" && <div style={{ marginTop: "16px", padding: "14px", borderRadius: "10px", background: "#8e8e9310", display: "flex", alignItems: "center", gap: "10px" }}><span style={{ fontSize: "14px", color: "#8e8e93", fontWeight: "500" }}>{t("orderRefunded")}</span></div>}
              </div>
            </div>
          );
        })}
      </div>}
    </div>
  );
};

// ════════════════════════════════════════
// MAIN APP
// ════════════════════════════════════════
export default function App() {
  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("blue");
  const [lang, setLang] = useState(() => { try { return sessionStorage.getItem("mp_lang") || "en"; } catch { return "en"; } });
  useEffect(() => { try { sessionStorage.setItem("mp_lang", lang); } catch {} }, [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang }}>
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      <AppInner />
    </ThemeContext.Provider>
    </LangContext.Provider>
  );
}

function AppInner() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang } = useLang();
  const t = useT();
  const c = useColors();
  const [token, setToken] = useState(() => { try { return sessionStorage.getItem("mp_token"); } catch { return null; } });
  const [user, setUser] = useState(() => { try { const u = sessionStorage.getItem("mp_user"); return u ? JSON.parse(u) : null; } catch { return null; } });
  const [page, setPage] = useState("home");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState(() => { try { const c = sessionStorage.getItem("mp_cart"); return c ? JSON.parse(c) : []; } catch { return []; } });
  const [watchlist, setWatchlist] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Persist token, user, and cart to sessionStorage
  useEffect(() => { try { if (token) sessionStorage.setItem("mp_token", token); else sessionStorage.removeItem("mp_token"); } catch {} }, [token]);
  useEffect(() => { try { if (user) sessionStorage.setItem("mp_user", JSON.stringify(user)); else sessionStorage.removeItem("mp_user"); } catch {} }, [user]);
  useEffect(() => { try { sessionStorage.setItem("mp_cart", JSON.stringify(cart)); } catch {} }, [cart]);

  // Auto-refresh user data every 30 seconds (keeps wallet balance current)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      api.get("/auth/me", token).then(u => setUser(u)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Restore session on mount — verify token is still valid
  useEffect(() => {
    if (token && user) {
      api.get("/auth/me", token).then(u => setUser(u)).catch(() => { setToken(null); setUser(null); });
    }
  }, []);

  // Fetch products and categories
  const loadProducts = async (search, category) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category && category !== "All") params.set("category", category);
      const data = await api.get(`/products?${params}`);
      setProducts(data.products);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try { const cats = await api.get("/categories"); setCategories(cats); } catch (err) { console.error(err); }
  };

  const refreshUser = async () => {
    if (!token) return;
    try { const u = await api.get("/auth/me", token); setUser(u); } catch (err) { console.error(err); }
  };

  useEffect(() => { loadCategories(); loadProducts(); }, []);
  useEffect(() => { loadProducts(searchQuery, selectedCategory); }, [searchQuery, selectedCategory]);

  const handleLogin = (t, u) => { setToken(t); setUser(u); setPage(u.role === "seller" ? "seller-dashboard" : u.role === "admin" ? "admin-dashboard" : "home"); };
  const handleLogout = () => { setToken(null); setUser(null); setCart([]); setPage("home"); setShowUserMenu(false); try { sessionStorage.removeItem("mp_token"); sessionStorage.removeItem("mp_user"); sessionStorage.removeItem("mp_cart"); } catch {} };

  const addToCart = (product, qty = 1) => {
    setCart(prev => { const ex = prev.find(i => i.id === product.id); if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i); return [...prev, { ...product, qty }]; });
    setSelectedProduct(null); setPage("home");
    setToast({ message: `${product.name} added to bag`, type: "success" });
  };

  const buyNow = (product, qty = 1) => { setCheckoutItems([{ ...product, qty }]); setSelectedProduct(null); setPage("checkout"); };

  const deals = products.filter(p => p.original_price);
  const trending = products.filter(p => p.is_trending);

  // Login screen
  if (!user) return (
    <>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box;margin:0}`}</style>
      <LoginPage onLogin={handleLogin} />
    </>
  );

  // Product detail
  if (selectedProduct) return (
    <><style>{`*{box-sizing:border-box;margin:0}`}</style>
    <div style={{ background: c.bg, minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      <ProductDetail product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={addToCart} onBuyNow={buyNow} />
    </div></>
  );

  // Checkout
  if (page === "checkout") return (
    <><style>{`*{box-sizing:border-box;margin:0}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{ background: c.bg, minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: c.text }}>
      <CheckoutPage items={checkoutItems} onBack={() => setPage("home")} token={token} user={user} refreshUser={refreshUser} onGoWallet={() => setPage("wallet")} onComplete={() => { setCart(prev => prev.filter(ci => !checkoutItems.find(co => co.id === ci.id))); setCheckoutItems([]); setPage("home"); setToast({ message: "Order placed!", type: "success" }); }} />
    </div></>
  );

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0}@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}@keyframes spin{to{transform:rotate(360deg)}}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${theme==="dark"?"#444":"#ccc"};border-radius:3px}input::placeholder{color:${c.textSec}}`}</style>
      <div style={{ background: c.bg, minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', color: c.text }}>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

        {/* Nav */}
        <nav style={{ position: "sticky", top: 0, zIndex: 100, background: c.navBg, backdropFilter: "blur(20px)", borderBottom: `0.5px solid ${c.border}` }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", height: "52px" }}>
            <button onClick={() => { setPage(user.role==="admin" ? "admin-dashboard" : "home"); setSearchQuery(""); setSelectedCategory("All"); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em" }}>{t("marketplace")}</button>
            <div style={{ flex: 1, maxWidth: "520px", margin: "0 24px", position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: c.textSec }}><I.Search /></div>
              <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage("home"); }} placeholder={t("searchMarketplace")} style={{ width: "100%", padding: "10px 16px 10px 40px", borderRadius: "10px", border: "none", background: c.pillBg, color: c.text, fontSize: "15px", outline: "none" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button onClick={() => setPage("wallet")} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 14px", background: c.pillBg, borderRadius: "50px", border: "none", cursor: "pointer" }}><I.Wallet /><span style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>${parseFloat(user.wallet_balance).toFixed(0)}</span></button>
              {user.role !== "admin" && <button onClick={() => setPage("cart")} style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: c.text }}><I.Cart />{cart.length > 0 && <span style={{ position: "absolute", top: "4px", right: "4px", width: "18px", height: "18px", borderRadius: "50%", background: "#ff3b30", color: "#fff", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center" }}>{cart.length}</span>}</button>}
              <button onClick={() => setTheme(theme==="dark"?"light":"dark")} style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: c.text }}>{theme==="dark" ? <I.Sun /> : <I.Moon />}</button>
              <button onClick={() => setLang(lang==="en"?"zh":"en")} style={{ height: "32px", padding: "0 12px", borderRadius: "50px", border: `1px solid ${c.border}`, background: c.pillBg, cursor: "pointer", fontSize: "13px", fontWeight: "600", color: c.text, display: "flex", alignItems: "center", gap: "4px" }}>{lang==="en" ? "中文" : "EN"}</button>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ width: "36px", height: "36px", borderRadius: "50%", border: "none", background: c.accent, color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>{user.avatar}</button>
                {showUserMenu && <div style={{ position: "absolute", right: 0, top: "44px", width: "220px", background: c.cardBg, borderRadius: "14px", border: `1px solid ${c.border}`, boxShadow: "0 8px 40px rgba(0,0,0,0.15)", animation: "slideDown 0.2s ease", overflow: "hidden", zIndex: 200 }}>
                  <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.border}` }}><p style={{ fontSize: "14px", fontWeight: "600", color: c.text }}>{user.name}</p><p style={{ fontSize: "12px", color: c.textSec, textTransform: "capitalize" }}>{user.role} · ${parseFloat(user.wallet_balance).toFixed(0)}</p></div>
                  {[{l:t("wallet"),i:<I.Wallet />,a:() => setPage("wallet")},{l:t("myOrders"),i:<I.Package />,a:() => setPage("orders")},
                    ...(user.role==="seller" ? [{l:t("incomingOrders"),i:<I.FileText />,a:() => setPage("seller-orders")},{l:t("myEarnings"),i:<I.DollarSign />,a:() => setPage("seller-earnings")}] : []),
                    {l:t("settings"),i:<I.Settings />,a:() => setPage("settings")},{l:t("browseStore"),i:<I.Home />,a:() => setPage("home")},
                    ...(user.role==="admin" ? [{l:t("adminPanel"),i:<I.Shield />,a:() => setPage("admin-dashboard")}] : [])
                  ].map((item,i) => <button key={i} onClick={() => { item.a(); setShowUserMenu(false); }} style={{ width: "100%", padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: c.text, textAlign: "left" }} onMouseOver={e => e.currentTarget.style.background = c.hoverBg} onMouseOut={e => e.currentTarget.style.background = "transparent"}><span style={{ color: c.textSec }}>{item.i}</span>{item.l}</button>)}
                  <div style={{ borderTop: `1px solid ${c.border}` }}><button onClick={handleLogout} style={{ width: "100%", padding: "12px 20px", border: "none", background: "transparent", cursor: "pointer", fontSize: "14px", color: "#ff3b30", textAlign: "left" }}>{t("signOut")}</button></div>
                </div>}
              </div>
            </div>
          </div>
        </nav>

        {showUserMenu && <div onClick={() => setShowUserMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 50 }} />}

        {page === "settings" && <SettingsPage user={user} onBack={() => setPage("home")} />}
        {page === "orders" && <OrdersPage token={token} onBack={() => setPage("home")} />}
        {page === "wallet" && <WalletPage token={token} user={user} refreshUser={refreshUser} onBack={() => setPage("home")} />}
        {page === "seller-earnings" && <SellerEarningsPage token={token} onBack={() => setPage("home")} />}
        {page === "seller-orders" && <SellerOrdersPage token={token} onBack={() => setPage("home")} />}
        {page === "cart" && <CartPage cart={cart} onUpdateQty={(id,q) => { if (q<1) setCart(cart.filter(i=>i.id!==id)); else setCart(cart.map(i=>i.id===id?{...i,qty:q}:i)); }} onRemove={id => setCart(cart.filter(i=>i.id!==id))} onBack={() => setPage("home")} onCheckout={() => { setCheckoutItems([...cart]); setPage("checkout"); }} />}
        {page === "admin-dashboard" && <AdminDashboard token={token} />}

        {page === "home" && (
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
            {!searchQuery && selectedCategory === "All" && (
              <div style={{ background: theme==="dark" ? "linear-gradient(135deg,#1a1a2e,#16213e)" : "linear-gradient(135deg,#667eea,#764ba2)", borderRadius: "24px", padding: "60px 48px", margin: "24px 0 40px" }}>
                <p style={{ fontSize: "14px", fontWeight: "500", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>{t("springCollection")}</p>
                <h2 style={{ fontSize: "42px", fontWeight: "700", color: "#fff", letterSpacing: "-0.03em", lineHeight: "1.1", marginBottom: "12px", maxWidth: "500px" }}>{t("discoverNew")}</h2>
                <p style={{ fontSize: "18px", color: "rgba(255,255,255,0.8)", marginBottom: "28px", maxWidth: "460px" }}>{t("curatedCollections")}</p>
              </div>
            )}

            <div style={{ display: "flex", gap: "8px", marginBottom: "32px", overflowX: "auto", padding: "4px 0" }}>
              {[t("all"), ...categories.map(c => c.name)].map((cat,i) => <button key={cat} onClick={() => setSelectedCategory(i===0?"All":cat)} style={{ padding: "10px 22px", borderRadius: "50px", border: `1.5px solid ${(i===0?selectedCategory==="All":selectedCategory===cat) ? c.accent : c.border}`, background: (i===0?selectedCategory==="All":selectedCategory===cat) ? c.accent+"14" : "transparent", color: (i===0?selectedCategory==="All":selectedCategory===cat) ? c.accent : c.textSec, fontSize: "14px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }}>{cat}</button>)}
            </div>

            {loading ? <div style={{ textAlign: "center", padding: "60px" }}><Spinner size={32} /></div> : <>
              {!searchQuery && selectedCategory === "All" && deals.length > 0 && (
                <div style={{ marginBottom: "48px" }}>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "20px" }}>{t("todaysDeals")}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>{deals.slice(0,4).map(p => <ProductCard key={p.id} product={p} onView={setSelectedProduct} onToggleWatchlist={id => setWatchlist(prev => prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} isWatched={watchlist.includes(p.id)} />)}</div>
                </div>
              )}
              {!searchQuery && selectedCategory === "All" && trending.length > 0 && (
                <div style={{ marginBottom: "48px" }}>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em", marginBottom: "20px" }}>{t("trendingNow")}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>{trending.slice(0,4).map(p => <ProductCard key={p.id} product={p} onView={setSelectedProduct} onToggleWatchlist={id => setWatchlist(prev => prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} isWatched={watchlist.includes(p.id)} />)}</div>
                </div>
              )}
              <div style={{ marginBottom: "60px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "20px" }}>
                  <h2 style={{ fontSize: "28px", fontWeight: "700", color: c.text, letterSpacing: "-0.03em" }}>{searchQuery ? `${t("resultsFor")}"${searchQuery}"` : selectedCategory !== "All" ? selectedCategory : t("allProducts")}</h2>
                  <span style={{ fontSize: "14px", color: c.textSec }}>{products.length} {t("items")}</span>
                </div>
                {products.length === 0 ? <div style={{ textAlign: "center", padding: "60px" }}><p style={{ fontSize: "18px", color: c.textSec }}>{t("noProductsFound")}</p></div> :
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>{products.map(p => <ProductCard key={p.id} product={p} onView={setSelectedProduct} onToggleWatchlist={id => setWatchlist(prev => prev.includes(id)?prev.filter(i=>i!==id):[...prev,id])} isWatched={watchlist.includes(p.id)} />)}</div>
                }
              </div>
            </>}

            <footer style={{ borderTop: `1px solid ${c.border}`, padding: "40px 0" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "32px", marginBottom: "32px" }}>
                {[{t:"shop",l:["Categories","Deals","Trending"]},{t:"sell",l:["Start Selling","Seller Hub","Fees"]},{t:"help",l:["Help Center","Contact Us","Returns"]},{t:"about",l:["About Us","Careers","Press"]}].map((col,i) => <div key={i}><h4 style={{ fontSize: "13px", fontWeight: "600", color: c.text, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>{col.t}</h4>{col.l.map(link => <p key={link} style={{ fontSize: "14px", color: c.textSec, marginBottom: "10px", cursor: "pointer" }}>{link}</p>)}</div>)}
              </div>
              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: "24px", display: "flex", justifyContent: "space-between" }}>
                <p style={{ fontSize: "13px", color: c.textSec }}>{t("allRightsReserved")}</p>
                <div style={{ display: "flex", gap: "20px" }}>{["Terms","Privacy","Cookies"].map(l => <span key={l} style={{ fontSize: "13px", color: c.textSec, cursor: "pointer" }}>{l}</span>)}</div>
              </div>
            </footer>
          </div>
        )}
      </div>
    </>
  );
}
