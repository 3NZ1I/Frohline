// XLSX export with real Excel format support
import * as XLSX from 'xlsx';

export function exportToExcel(data, filename) {
  // Create CSV content with UTF-8 BOM for proper Turkish character display
  const BOM = '\uFEFF'; // UTF-8 BOM
  const csvContent = data.map(row =>
    row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma
      const cellStr = String(cell).replace(/"/g, '""');
      return cellStr.includes(',') || cellStr.includes('\n') ? `"${cellStr}"` : cellStr;
    }).join(',')
  ).join('\n');

  // Create blob with UTF-8 encoding
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrderToXLSX(orderData, items, customer, brandName, language, includePrices = true) {
  const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US');

  const tr = {
    title: 'Sipariş Formu',
    customer: 'Müşteri',
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

  // Calculate totals - use product_weight if weight is not available
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.weight || item.product_weight || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare data for worksheet
  const wsData = [];
  
  // Header
  wsData.push([t.title]);
  wsData.push([]);
  wsData.push([t.customer, customer?.name || '']);
  wsData.push([t.brand, brandName]);
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
      parseFloat((weight * item.quantity).toFixed(2)),
    ];
    
    if (includePrices) {
      row.push(parseFloat(item.unit_price.toFixed(2)));
      row.push(parseFloat(item.subtotal.toFixed(2)));
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
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 5 },  // #
    { wch: 40 }, // Product name
    { wch: 15 }, // SKU
    { wch: 10 }, // Qty
    { wch: 15 }, // Weight
  ];
  
  if (includePrices) {
    worksheet['!cols'].push({ wch: 15 }); // Price
    worksheet['!cols'].push({ wch: 15 }); // Subtotal
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Order');
  
  // Export file
  const filename = `Order_${customer?.name?.replace(/\s+/g, '_') || 'New'}_${includePrices ? 'with_prices' : 'no_prices'}_${new Date().getTime()}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
