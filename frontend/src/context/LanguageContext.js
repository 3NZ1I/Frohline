import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  tr: {
    // Sidebar
    orders: '📋 Siparişler',
    newOrder: '➕ Yeni Sipariş',
    customers: '👥 Müşteriler',
    products: '📦 Ürünler',
    // Orders page
    ordersTitle: 'Siparişler',
    newOrderBtn: '➕ Yeni Sipariş',
    customer: 'Müşteri',
    status: 'Durum',
    total: 'Toplam',
    actions: 'İşlemler',
    noOrders: 'Sipariş bulunamadı',
    allOrders: 'Tüm Siparişler',
    orderId: 'Sipariş No',
    amount: 'Tutar',
    created: 'Oluşturulma',
    edit: 'Düzenle',
    // Order statuses
    pending: 'Bekliyor',
    in_progress: 'İşlemde',
    completed: 'Tamamlandı',
    cancelled: 'İptal Edildi',
    // Order Form
    createOrder: 'Sipariş Oluştur',
    editOrder: 'Siparişi Düzenle',
    selectCustomer: 'Müşteri Seçin',
    selectProduct: 'Ürün Seçin',
    quantity: 'Adet',
    unitPrice: 'Birim Fiyat',
    subtotal: 'Ara Toplam',
    addProduct: 'Ürün Ekle',
    notes: 'Notlar',
    save: 'Kaydet',
    cancel: 'İptal',
    back: 'Geri',
    subBrand: 'Alt Marka',
    selectSubBrand: 'Alt Marka Seçin',
    orderItems: 'Sipariş Kalemleri',
    orderDetails: 'Sipariş Detayları',
    orderSummary: 'Sipariş Özeti',
    weight: 'Ağırlık',
    // Products
    productName: 'Ürün Adı (TR | EN | AR)',
    sku: 'Stok Kodu',
    price: 'Fiyat',
    stock: 'Stok',
    noProducts: 'Ürün bulunamadı',
    // Customers
    customersTitle: 'Müşteriler',
    addCustomer: '➕ Müşteri Ekle',
    name: 'Ad Soyad',
    email: 'E-posta',
    phone: 'Telefon',
    company: 'Şirket',
    address: 'Adres',
    noCustomers: 'Müşteri bulunamadı',
  },
  en: {
    // Sidebar
    orders: '📋 Orders',
    newOrder: '➕ New Order',
    customers: '👥 Customers',
    products: '📦 Products',
    // Orders page
    ordersTitle: 'Orders',
    newOrderBtn: '➕ New Order',
    customer: 'Customer',
    status: 'Status',
    total: 'Total',
    actions: 'Actions',
    noOrders: 'No orders found',
    allOrders: 'All Orders',
    orderId: 'Order ID',
    amount: 'Amount',
    created: 'Created',
    edit: 'Edit',
    // Order statuses
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    // Order Form
    createOrder: 'Create Order',
    editOrder: 'Edit Order',
    selectCustomer: 'Select Customer',
    selectProduct: 'Select Product',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',
    addProduct: 'Add Product',
    notes: 'Notes',
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    subBrand: 'Sub Brand',
    selectSubBrand: 'Select Sub Brand',
    orderItems: 'Order Items',
    orderDetails: 'Order Details',
    orderSummary: 'Order Summary',
    weight: 'Weight',
    // Products
    productName: 'Product Name (TR | EN | AR)',
    sku: 'SKU',
    price: 'Price',
    stock: 'Stock',
    noProducts: 'No products found',
    // Customers
    customersTitle: 'Customers',
    addCustomer: '➕ Add Customer',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    company: 'Company',
    address: 'Address',
    noCustomers: 'No customers found',
  },
  ar: {
    // Sidebar
    orders: '📋 الطلبات',
    newOrder: '➕ طلب جديد',
    customers: '👥 العملاء',
    products: '📦 المنتجات',
    // Orders page
    ordersTitle: 'الطلبات',
    newOrderBtn: '➕ طلب جديد',
    customer: 'العميل',
    status: 'الحالة',
    total: 'المجموع',
    actions: 'إجراءات',
    noOrders: 'لم يتم العثور على طلبات',
    allOrders: 'جميع الطلبات',
    orderId: 'رقم الطلب',
    amount: 'المبلغ',
    created: 'تاريخ الإنشاء',
    edit: 'تعديل',
    // Order statuses
    pending: 'قيد الانتظار',
    in_progress: 'قيد المعالجة',
    completed: 'مكتمل',
    cancelled: 'ملغي',
    // Order Form
    createOrder: 'إنشاء طلب',
    editOrder: 'تعديل الطلب',
    selectCustomer: 'اختر العميل',
    selectProduct: 'اختر المنتج',
    quantity: 'الكمية',
    unitPrice: 'سعر الوحدة',
    subtotal: 'المجموع الجزئي',
    addProduct: 'إضافة منتج',
    notes: 'ملاحظات',
    save: 'حفظ',
    cancel: 'إلغاء',
    back: 'رجوع',
    subBrand: 'العلامة الفرعية',
    selectSubBrand: 'اختر العلامة الفرعية',
    orderItems: 'عناصر الطلب',
    orderDetails: 'تفاصيل الطلب',
    orderSummary: 'ملخص الطلب',
    weight: 'الوزن',
    // Products
    productName: 'اسم المنتج (TR | EN | AR)',
    sku: 'رمز المنتج',
    price: 'السعر',
    stock: 'المخزون',
    noProducts: 'لم يتم العثور على منتجات',
    // Customers
    customersTitle: 'العملاء',
    addCustomer: '➕ إضافة عميل',
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'الهاتف',
    company: 'الشركة',
    address: 'العنوان',
    noCustomers: 'لم يتم العثور على عملاء',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('tr');

  const t = (key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
