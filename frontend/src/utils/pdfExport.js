// Enhanced PDF Export with better formatting, Turkish font support, and structured layout
import { subBrands } from '../data/subBrands';

export async function exportOrderAsPDF(order, customer, brandName, includePrices, language) {
  const jsPDF = (await import('jspdf')).default;
  
  const pdfLabels = {
    en: { title: 'Order Form', customer: 'Customer', company: 'Company', brand: 'Brand', date: 'Date', status: 'Status', product: 'Product', sku: 'SKU', qty: 'Qty', weight: 'Weight', price: 'Price', subtotal: 'Subtotal', totalQty: 'Total Qty', totalWeight: 'Total Weight', totalAmount: 'Total Amount', notes: 'Notes', withPrices: 'with_prices', withoutPrices: 'without_prices' },
    tr: { title: 'Sipariş Formu', customer: 'Müşteri', company: 'Şirket', brand: 'Marka', date: 'Tarih', status: 'Durum', product: 'Ürün', sku: 'SKU', qty: 'Adet', weight: 'Ağırlık', price: 'Fiyat', subtotal: 'Ara Toplam', totalQty: 'Toplam Adet', totalWeight: 'Toplam Ağırlık', totalAmount: 'Toplam Tutar', notes: 'Notlar', withPrices: 'fiyatli', withoutPrices: 'fiyatsiz' },
    ar: { title: 'نموذج الطلب', customer: 'العميل', company: 'الشركة', brand: 'العلامة التجارية', date: 'التاريخ', status: 'الحالة', product: 'المنتج', sku: 'رمز المنتج', qty: 'الكمية', weight: 'الوزن', price: 'السعر', subtotal: 'المجموع الجزئي', totalQty: 'إجمالي الكمية', totalWeight: 'إجمالي الوزن', totalAmount: 'إجمالي المبلغ', notes: 'ملاحظات', withPrices: 'مع_الأسعار', withoutPrices: 'بدون_أسعار' },
  };

  const l = pdfLabels[language] || pdfLabels.en;
  const date = new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    lineHeight: 1.2,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPos = margin;

  // Header with colored background
  pdf.setFillColor(52, 152, 219);
  pdf.rect(margin, yPos - 5, contentWidth, 20, 'F');
  pdf.setFontSize(16);
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l.title, pageWidth / 2, yPos + 5, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  yPos += 18;

  // Order info in boxes
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  const boxWidth = (contentWidth - 10) / 2;
  
  // Customer info box
  pdf.setDrawColor(200, 200, 200);
  pdf.setFillColor(248, 249, 250);
  pdf.roundedRect(margin, yPos, boxWidth, 22, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.text(l.customer, margin + 3, yPos + 6);
  pdf.setFont('helvetica', 'normal');
  const customerName = customer?.name || '-';
  const splitCustomer = pdf.splitTextToSize(customerName, boxWidth - 6);
  pdf.text(splitCustomer, margin + 3, yPos + 11);
  if (customer?.company) {
    const splitCompany = pdf.splitTextToSize(customer.company, boxWidth - 6);
    pdf.text(splitCompany, margin + 3, yPos + 16);
  }
  
  // Brand/Date info box
  pdf.roundedRect(margin + boxWidth + 10, yPos, boxWidth, 22, 2, 2, 'FD');
  pdf.setFont('helvetica', 'bold');
  pdf.text(l.brand, margin + boxWidth + 13, yPos + 6);
  pdf.setFont('helvetica', 'normal');
  const splitBrand = pdf.splitTextToSize(brandName, boxWidth - 6);
  pdf.text(splitBrand, margin + boxWidth + 13, yPos + 11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(l.date, margin + boxWidth + 13, yPos + 17);
  pdf.setFont('helvetica', 'normal');
  pdf.text(date, margin + boxWidth + 13, yPos + 22);
  
  yPos += 26;
  
  // Status badge
  const statusColors = {
    pending: { fill: [255, 193, 7], text: [0, 0, 0] },
    in_progress: { fill: [23, 162, 184], text: [255, 255, 255] },
    completed: { fill: [40, 167, 69], text: [255, 255, 255] },
    cancelled: { fill: [220, 53, 69], text: [255, 255, 255] },
  };
  const statusColor = statusColors[order.status] || statusColors.pending;
  pdf.setFillColor(...statusColor.fill);
  pdf.setTextColor(...statusColor.text);
  pdf.roundedRect(margin, yPos, 40, 7, 1.5, 1.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.text(order.status.toUpperCase(), margin + 20, yPos + 4.5, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  yPos += 10;

  // Products table header
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setFillColor(233, 236, 239);
  pdf.setTextColor(49, 58, 70);
  
  const colWidths = includePrices ? [10, 60, 25, 15, 22, 20, 18] : [10, 70, 25, 15, 22, 28];
  const colHeaders = ['#', l.product, l.sku, l.qty, l.weight];
  if (includePrices) {
    colHeaders.push(l.price, l.subtotal);
  }
  
  let xPos = margin;
  colHeaders.forEach((header, i) => {
    pdf.rect(xPos, yPos, colWidths[i], 7, 'FD');
    pdf.text(header, xPos + colWidths[i] / 2, yPos + 4.5, { align: 'center' });
    xPos += colWidths[i];
  });
  
  yPos += 7;

  // Products data with row borders
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(33, 37, 41);
  
  order.items.forEach((item, index) => {
    const weight = item.weight || item.product_weight || 0;
    const rowHeight = 9;
    
    // Check if we need a new page
    if (yPos + rowHeight > pageHeight - 60) {
      pdf.addPage();
      yPos = margin;
      // Redraw table header on new page
      xPos = margin;
      colHeaders.forEach((header, i) => {
        pdf.rect(xPos, yPos, colWidths[i], 7, 'FD');
        pdf.text(header, xPos + colWidths[i] / 2, yPos + 4.5, { align: 'center' });
        xPos += colWidths[i];
      });
      yPos += 7;
    }
    
    // Alternating row colors
    if (index % 2 === 1) {
      pdf.setFillColor(252, 252, 252);
      pdf.rect(margin, yPos, contentWidth, rowHeight, 'F');
    }
    
    xPos = margin;
    
    // Item number
    pdf.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5.5, { align: 'center' });
    xPos += colWidths[0];
    
    // Product name with text wrapping
    const productName = item.product_name.split('|')[0]?.trim() || '';
    const maxProductName = colWidths[1] - 2;
    const splitName = pdf.splitTextToSize(productName, maxProductName);
    pdf.text(splitName, xPos + 1, yPos + 3);
    xPos += colWidths[1];
    
    // SKU
    pdf.text(item.product_sku || '-', xPos + colWidths[2] / 2, yPos + 5.5, { align: 'center' });
    xPos += colWidths[2];
    
    // Quantity
    pdf.text(item.quantity.toString(), xPos + colWidths[3] / 2, yPos + 5.5, { align: 'center' });
    xPos += colWidths[3];
    
    // Weight
    pdf.text(`${(weight * item.quantity).toFixed(2)} m`, xPos + colWidths[4] / 2, yPos + 5.5, { align: 'center' });
    xPos += colWidths[4];
    
    if (includePrices) {
      // Price
      pdf.text(`$${item.unit_price.toFixed(2)}`, xPos + colWidths[5] / 2, yPos + 5.5, { align: 'center' });
      xPos += colWidths[5];
      // Subtotal
      pdf.text(`$${item.subtotal.toFixed(2)}`, xPos + colWidths[6] / 2, yPos + 5.5, { align: 'center' });
    }
    
    // Draw row border
    pdf.setDrawColor(222, 226, 230);
    pdf.rect(margin, yPos, contentWidth, rowHeight, 'S');
    
    yPos += rowHeight;
  });

  yPos += 3;

  // Totals section with colored background
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = order.items.reduce((sum, item) => {
    const weight = item.weight || item.product_weight || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  pdf.setFillColor(232, 245, 233);
  pdf.setDrawColor(76, 175, 80);
  pdf.roundedRect(margin, yPos, contentWidth, 22, 2, 2, 'FD');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(27, 94, 32);
  pdf.text(`${l.totalQty}: ${totalQty}`, margin + 3, yPos + 7);
  pdf.text(`${l.totalWeight}: ${totalWeight.toFixed(2)} m`, margin + 3, yPos + 13);
  if (includePrices) {
    pdf.text(`${l.totalAmount}: $${totalAmount.toFixed(2)}`, margin + 3, yPos + 19);
  }
  pdf.setTextColor(0, 0, 0);
  yPos += 26;

  // Notes section
  if (order.notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${l.notes}:`, margin, yPos);
    yPos += 5;
    pdf.setFont('helvetica', 'normal');
    const splitNotes = pdf.splitTextToSize(order.notes, contentWidth - 4);
    const notesHeight = splitNotes.length * 4.5 + 3;
    pdf.setFillColor(255, 251, 235);
    pdf.setDrawColor(255, 193, 7);
    pdf.roundedRect(margin, yPos - 2, contentWidth, notesHeight, 2, 2, 'FD');
    pdf.text(splitNotes, margin + 2, yPos + 2.5);
    yPos += notesHeight + 3;
  }

  // Footer with page numbers
  const pageCount = pdf.internal.getNumberOfPages();
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(128, 128, 128);
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 10, pageHeight - 10, { align: 'right' });
    pdf.text(`Order: ${order.id.slice(0, 8).toUpperCase()}`, margin, pageHeight - 10);
  }

  // Save PDF
  const fileNameSuffix = includePrices ? l.withPrices : l.withoutPrices;
  const filename = `Order_${order.id.slice(0, 8)}_${(customer?.name || 'Order').replace(/\s+/g, '_')}_${fileNameSuffix}.pdf`;
  pdf.save(filename);
}
