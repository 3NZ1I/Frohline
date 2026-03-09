// XLSX export with ExcelJS for image support
import ExcelJS from 'exceljs';
import { subBrands } from '../data/subBrands';

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

  // Get sub-brand logo
  const subBrand = subBrands.find(b => b.id === orderData.sub_brand_id);

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Order');

  // Set RTL for Arabic
  if (language === 'ar') {
    worksheet.properties.rightToLeft = true;
  }

  // Define all columns at once with proper widths
  const numColumns = includePrices ? 7 : 5;
  worksheet.columns = [];
  for (let i = 0; i < numColumns; i++) {
    worksheet.columns.push({ width: 10 });
  }

  // Set specific column widths
  worksheet.getColumn(1).width = 8;   // #
  worksheet.getColumn(2).width = 50;  // Product Name
  worksheet.getColumn(3).width = 15;  // SKU
  worksheet.getColumn(4).width = 10;  // Qty
  worksheet.getColumn(5).width = 15;  // Weight
  if (includePrices) {
    worksheet.getColumn(6).width = 15;  // Price
    worksheet.getColumn(7).width = 15;  // Subtotal
  }

  // Row counter
  let row = 1;

  // Header with title
  worksheet.mergeCells(`A${row}:${String.fromCharCode(64 + numColumns)}${row}`);
  const headerCell = worksheet.getCell(`A${row}`);
  headerCell.value = t.title;
  headerCell.font = { size: 20, bold: true };
  headerCell.alignment = { vertical: 'middle', horizontal: 'center' };
  headerCell.border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thick' },
    right: { style: 'thin' },
  };
  row++;

  // Add blank row
  row++;

  // Add Frohline logo and Sub-brand logo if available
  try {
    // Frohline logo
    const frohlineLogoResponse = await fetch('/company-logo.png');
    if (frohlineLogoResponse.ok) {
      const logoBuffer = await frohlineLogoResponse.arrayBuffer();
      const logoId = workbook.addImage({
        buffer: Buffer.from(logoBuffer),
        extension: 'png',
      });
      worksheet.addImage(logoId, {
        tl: { col: 0.5, row: row - 1 },
        ext: { width: 100, height: 35 },
      });
    }

    // Sub-brand logo
    if (subBrand?.logo) {
      const subBrandLogoResponse = await fetch(subBrand.logo);
      if (subBrandLogoResponse.ok) {
        const subBrandBuffer = await subBrandLogoResponse.arrayBuffer();
        const subBrandId = workbook.addImage({
          buffer: Buffer.from(subBrandBuffer),
          extension: 'png',
        });
        worksheet.addImage(subBrandId, {
          tl: { col: 3, row: row - 1 },
          ext: { width: 80, height: 35 },
        });
      }
    }
  } catch (e) {
    console.log('Logo not available:', e);
  }

  row++;

  // Order details
  const details = [
    [t.customer, customer?.name || '', customer?.company || ''],
    [t.brand, brandName, ''],
    [t.date, date, ''],
    [t.status, orderData.status, ''],
  ];

  details.forEach(([label, value, extra]) => {
    worksheet.getCell(`A${row}`).value = label;
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`A${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    worksheet.getCell(`B${row}`).value = value;
    worksheet.getCell(`B${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };

    if (extra) {
      worksheet.getCell(`C${row}`).value = extra;
      worksheet.getCell(`C${row}`).border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    }

    row++;
  });

  // Blank row
  row++;

  // Items header
  const itemHeader = ['#', t.product, t.sku, t.qty, t.weight];
  if (includePrices) {
    itemHeader.push(t.price);
    itemHeader.push(t.subtotal);
  }

  const headerRow = worksheet.getRow(row);
  itemHeader.forEach((value, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = value;
    cell.font = { bold: true };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });
  row++;

  // Items data
  items.forEach((item, index) => {
    const weight = item.weight || item.product_weight || 0;
    const rowData = [
      index + 1,
      item.product_name.split('|')[0]?.trim(),
      item.product_sku,
      item.quantity,
      parseFloat((weight * item.quantity).toFixed(2)),
    ];

    if (includePrices) {
      rowData.push(parseFloat(item.unit_price.toFixed(2)));
      rowData.push(parseFloat(item.subtotal.toFixed(2)));
    }

    const dataRow = worksheet.getRow(row);
    rowData.forEach((value, i) => {
      const cell = dataRow.getCell(i + 1);
      cell.value = value;
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    row++;
  });

  // Blank row
  row++;

  // Totals
  worksheet.getCell(`A${row}`).value = t.totalQty;
  worksheet.getCell(`A${row}`).font = { bold: true };
  worksheet.getCell(`A${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  worksheet.getCell(`B${row}`).value = totalQty;
  worksheet.getCell(`B${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  row++;

  worksheet.getCell(`A${row}`).value = t.totalWeight;
  worksheet.getCell(`A${row}`).font = { bold: true };
  worksheet.getCell(`A${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  worksheet.getCell(`B${row}`).value = `${totalWeight.toFixed(2)} kg`;
  worksheet.getCell(`B${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  row++;

  if (includePrices) {
    worksheet.getCell(`A${row}`).value = t.totalAmount;
    worksheet.getCell(`A${row}`).font = { bold: true };
    worksheet.getCell(`A${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    worksheet.getCell(`B${row}`).value = `$${totalAmount.toFixed(2)}`;
    worksheet.getCell(`B${row}`).border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
    row++;
  }

  // Blank row
  row++;

  // Notes
  worksheet.getCell(`A${row}`).value = t.notes;
  worksheet.getCell(`A${row}`).font = { bold: true };
  worksheet.getCell(`A${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  worksheet.getCell(`B${row}`).value = orderData.notes || '';
  worksheet.getCell(`B${row}`).border = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' },
  };
  worksheet.getCell(`B${row}`).alignment = { wrapText: true };
  worksheet.mergeCells(`B${row}:${String.fromCharCode(64 + numColumns)}${row}`);

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
