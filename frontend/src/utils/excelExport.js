// XLSX export with ExcelJS for image support
import ExcelJS from 'exceljs';

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

export async function exportOrderToXLSX(orderData, items, customer, brandName, language, includePrices = true) {
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

  // Calculate totals
  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.weight || item.product_weight || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Order');

  // Set RTL for Arabic
  if (language === 'ar') {
    worksheet.properties.rightToLeft = true;
  }

  // Column widths
  worksheet.columns = [
    { key: 'label', width: 15 },
    { key: 'value', width: 40 },
  ];

  // Header with logo placeholder
  worksheet.mergeCells('A1:B1');
  const headerCell = worksheet.getCell('A1');
  headerCell.value = t.title;
  headerCell.font = { size: 20, bold: true };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center' };

  // Add Frohline logo if available
  try {
    const logoResponse = await fetch('/company-logo.png');
    if (logoResponse.ok) {
      const logoBuffer = await logoResponse.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: Buffer.from(logoBuffer),
        extension: 'png',
      });
      logoId.nm = 'Frohline Logo';
      worksheet.addImage(logoId, {
        tl: { col: 0.5, row: 0 },
        ext: { width: 120, height: 40 },
      });
    }
  } catch (e) {
    console.log('Logo not available');
  }

  // Order details
  const details = [
    [t.customer, customer?.name || ''],
    [customer?.company ? t.company || 'Company' : t.brand, customer?.company || brandName],
    [t.date, date],
    [t.status, orderData.status],
  ];

  details.forEach(([label, value], index) => {
    worksheet.getCell(`A${index + 3}`).value = label;
    worksheet.getCell(`A${index + 3}`).font = { bold: true };
    worksheet.getCell(`B${index + 3}`).value = value;
  });

  // Items header
  const itemsStartRow = details.length + 5;
  const itemHeader = ['#', t.product, t.sku, t.qty, t.weight];
  if (includePrices) {
    itemHeader.push(t.price);
    itemHeader.push(t.subtotal);
  }

  worksheet.spliceRows(itemsStartRow, 0, [itemHeader]);
  const headerRow = worksheet.getRow(itemsStartRow);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

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

    const rowNum = itemsStartRow + index + 1;
    worksheet.spliceRows(rowNum, 0, [row]);
    worksheet.getRow(rowNum).alignment = { vertical: 'middle' };
  });

  // Set column widths for items
  const itemColWidths = [8, 45, 15, 10, 15];
  if (includePrices) {
    itemColWidths.push(15, 15);
  }
  itemColWidths.forEach((width, i) => {
    worksheet.getColumn(i + 1).width = width;
  });

  // Totals
  const totalsRow = itemsStartRow + items.length + 2;
  worksheet.getCell(`A${totalsRow}`).value = t.totalQty;
  worksheet.getCell(`A${totalsRow}`).font = { bold: true };
  worksheet.getCell(`B${totalsRow}`).value = totalQty;

  worksheet.getCell(`A${totalsRow + 1}`).value = t.totalWeight;
  worksheet.getCell(`A${totalsRow + 1}`).font = { bold: true };
  worksheet.getCell(`B${totalsRow + 1}`).value = `${totalWeight.toFixed(2)} kg`;

  if (includePrices) {
    worksheet.getCell(`A${totalsRow + 2}`).value = t.totalAmount;
    worksheet.getCell(`A${totalsRow + 2}`).font = { bold: true };
    worksheet.getCell(`B${totalsRow + 2}`).value = `$${totalAmount.toFixed(2)}`;
  }

  // Notes
  const notesRow = totalsRow + 5;
  worksheet.getCell(`A${notesRow}`).value = t.notes;
  worksheet.getCell(`A${notesRow}`).font = { bold: true };
  worksheet.getCell(`B${notesRow}`).value = orderData.notes || '';
  worksheet.getCell(`B${notesRow}`).alignment = { wrapText: true };

  // Border styling
  const lastRow = notesRow + 2;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < lastRow) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    }
  });

  // Export file
  const filename = `Order_${customer?.name?.replace(/\s+/g, '_') || 'New'}_${includePrices ? 'with_prices' : 'no_prices'}_${new Date().getTime()}.xlsx`;
  
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
