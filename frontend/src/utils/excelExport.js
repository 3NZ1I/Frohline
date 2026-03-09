// XLSX export using xlsx library
import * as XLSX from 'xlsx';

export function exportToExcel(data, filename) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
}

export function exportOrderToXLSX(orderData, items, customer, brandName, language, includePrices = true) {
  const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US');

  const tr = {
    title: 'Sipariş Formu',
    customer: 'Müşteri',
    company: 'Şirket',
    brand: 'Marka',
    date: 'Tarih',
    status: 'Durum',
    product: 'Ürün Adı',
    sku: 'Stok Kodu',
    qty: 'Adet',
    weight: 'Ağırlık (kg)',
    price: 'Birim Fiyat ($)',
    subtotal: 'Ara Toplam ($)',
    totalQty: 'Toplam Adet',
    totalWeight: 'Toplam Ağırlık',
    totalAmount: 'Toplam Tutar',
    notes: 'Notlar',
  };

  const en = {
    title: 'Order Form',
    customer: 'Customer',
    company: 'Company',
    brand: 'Brand',
    date: 'Date',
    status: 'Status',
    product: 'Product Name',
    sku: 'SKU',
    qty: 'Quantity',
    weight: 'Weight (kg)',
    price: 'Unit Price ($)',
    subtotal: 'Subtotal ($)',
    totalQty: 'Total Quantity',
    totalWeight: 'Total Weight',
    totalAmount: 'Total Amount',
    notes: 'Notes',
  };

  const ar = {
    title: 'نموذج الطلب',
    customer: 'العميل',
    company: 'الشركة',
    brand: 'العلامة التجارية',
    date: 'التاريخ',
    status: 'الحالة',
    product: 'اسم المنتج',
    sku: 'رمز المنتج',
    qty: 'الكمية',
    weight: 'الوزن (كجم)',
    price: 'سعر الوحدة ($)',
    subtotal: 'المجموع الجزئي ($)',
    totalQty: 'إجمالي الكمية',
    totalWeight: 'إجمالي الوزن',
    totalAmount: 'إجمالي المبلغ',
    notes: 'ملاحظات',
  };

  const t = language === 'ar' ? ar : language === 'tr' ? tr : en;

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.weight || item.product_weight || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  // Create workbook
  const wb = XLSX.utils.book_new();
  const wsData = [];

  // Header
  wsData.push([t.title]);
  wsData.push([]);
  wsData.push([t.customer, customer?.name || '']);
  if (customer?.company) {
    wsData.push([t.company, customer.company]);
  } else {
    wsData.push([t.brand, brandName]);
  }
  wsData.push([t.date, date]);
  wsData.push([t.status, orderData.status]);
  wsData.push([]);

  // Items header
  const itemHeader = ['#', t.product, t.sku, t.qty, t.weight];
  if (includePrices) {
    itemHeader.push(t.price);
    itemHeader.push(t.subtotal);
  }
  wsData.push(itemHeader);

  // Items data
  items.forEach((item, index) => {
    const weight = item.weight || item.product_weight || 0;
    const row = [
      index + 1,
      item.product_name.split('|')[0]?.trim(),
      item.product_sku,
      item.quantity,
      (weight * item.quantity).toFixed(2),
    ];

    if (includePrices) {
      row.push(item.unit_price.toFixed(2));
      row.push(item.subtotal.toFixed(2));
    }

    wsData.push(row);
  });

  // Totals
  wsData.push([]);
  wsData.push([t.totalQty, totalQty]);
  wsData.push([t.totalWeight, `${totalWeight.toFixed(2)} kg`]);
  if (includePrices) {
    wsData.push([t.totalAmount, `$${totalAmount.toFixed(2)}`]);
  }
  wsData.push([]);
  wsData.push([t.notes, orderData.notes || '']);

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = [
    { wch: 5 },
    { wch: 50 },
    { wch: 15 },
    { wch: 10 },
    { wch: 15 },
  ];
  if (includePrices) {
    ws['!cols'].push({ wch: 15 }, { wch: 15 });
  }

  XLSX.utils.book_append_sheet(wb, ws, 'Order');

  // Export file
  const filename = `Order_${customer?.name?.replace(/\s+/g, '_') || 'New'}_${includePrices ? 'with_prices' : 'no_prices'}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(wb, filename);
}
