// Enhanced PDF Export with Turkish font support, sub-brand logo, and proper colors
import { subBrands } from '../data/subBrands';

export async function exportOrderAsPDF(order, customer, brandName, includePrices, language) {
  const jsPDF = (await import('jspdf')).default;
  
  const pdfLabels = {
    en: { title: 'Order Form', customer: 'Customer', company: 'Company', brand: 'Brand', date: 'Date', status: 'Status', product: 'Product', sku: 'SKU', qty: 'Qty', weight: 'Weight (m)', price: 'Price', subtotal: 'Subtotal', totalQty: 'Total Qty', totalWeight: 'Total Weight', totalAmount: 'Total Amount', notes: 'Notes', withPrices: 'with_prices', withoutPrices: 'without_prices' },
    tr: { title: 'Sipariş Formu', customer: 'Müşteri', company: 'Şirket', brand: 'Marka', date: 'Tarih', status: 'Durum', product: 'Ürün', sku: 'SKU', qty: 'Adet', weight: 'Ağırlık (m)', price: 'Fiyat', subtotal: 'Ara Toplam', totalQty: 'Toplam Adet', totalWeight: 'Toplam Ağırlık', totalAmount: 'Toplam Tutar', notes: 'Notlar', withPrices: 'fiyatli', withoutPrices: 'fiyatsiz' },
    ar: { title: 'نموذج الطلب', customer: 'العميل', company: 'الشركة', brand: 'العلامة التجارية', date: 'التاريخ', status: 'الحالة', product: 'اسم المنتج', sku: 'رمز المنتج', qty: 'الكمية', weight: 'الوزن (م)', price: 'السعر', subtotal: 'المجموع الجزئي', totalQty: 'إجمالي الكمية', totalWeight: 'إجمالي الوزن', totalAmount: 'إجمالي المبلغ', notes: 'ملاحظات', withPrices: 'مع_الأسعار', withoutPrices: 'بدون_أسعار' },
  };

  const l = pdfLabels[language] || pdfLabels.en;
  const date = new Date(order.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US');

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  let yPos = margin;

  // Header - Simple with light background
  pdf.setFillColor(240, 248, 255);
  pdf.rect(margin, yPos - 5, contentWidth, 18, 'F');
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(0, 0, 0);
  pdf.text(l.title, pageWidth / 2, yPos + 4, { align: 'center' });
  yPos += 16;

  // Try to load and add sub-brand logo
  if (order.sub_brand_id) {
    const brand = subBrands.find(b => b.id === order.sub_brand_id);
    if (brand?.logo) {
      try {
        const logoResponse = await fetch(brand.logo);
        if (logoResponse.ok) {
          const logoBlob = await logoResponse.blob();
          const logoReader = new FileReader();
          const logoDataUrl = await new Promise((resolve) => {
            logoReader.onloadend = () => resolve(logoReader.result);
            logoReader.readAsDataURL(logoBlob);
          });
          
          // Add logo to top right
          const logoSize = 12;
          pdf.addImage(logoDataUrl, 'PNG', pageWidth - margin - logoSize - 10, margin - 5, logoSize, logoSize);
        }
      } catch (e) {
        console.log('Could not add logo:', e);
      }
    }
  }

  // Order info - Clean layout without boxes
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${l.customer}:`, margin, yPos + 3);
  pdf.setFont('helvetica', 'normal');
  pdf.text(customer?.name || '-', margin + 25, yPos + 3);
  
  if (customer?.company) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${l.company}:`, margin + 80, yPos + 3);
    pdf.setFont('helvetica', 'normal');
    pdf.text(customer.company, margin + 100, yPos + 3);
  }
  
  yPos += 7;
  
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${l.brand}:`, margin, yPos + 3);
  pdf.setFont('helvetica', 'normal');
  pdf.text(brandName, margin + 25, yPos + 3);
  
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${l.date}:`, margin + 80, yPos + 3);
  pdf.setFont('helvetica', 'normal');
  pdf.text(date, margin + 100, yPos + 3);
  
  yPos += 8;
  
  // Status - Simple colored rectangle
  const statusColors = {
    pending: [255, 193, 7],
    in_progress: [23, 162, 184],
    completed: [40, 167, 69],
    cancelled: [220, 53, 69],
  };
  const statusColor = statusColors[order.status] || [128, 128, 128];
  
  pdf.setFillColor(...statusColor);
  pdf.rect(margin, yPos, 35, 6, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text(order.status.replace('_', ' ').toUpperCase(), margin + 17.5, yPos + 4, { align: 'center' });
  pdf.setTextColor(0, 0, 0);
  yPos += 9;

  // Products table header - Light gray background
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setFillColor(245, 245, 245);
  pdf.setTextColor(33, 37, 41);
  
  const colWidths = includePrices ? [10, 55, 25, 15, 25, 20, 20] : [10, 65, 25, 15, 25, 35];
  const colHeaders = ['#', l.product, l.sku, l.qty, l.weight];
  if (includePrices) {
    colHeaders.push(l.price, l.subtotal);
  }
  
  let xPos = margin;
  colHeaders.forEach((header, i) => {
    pdf.setFillColor(245, 245, 245);
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
    const rowHeight = 8;
    
    // Check if we need a new page
    if (yPos + rowHeight > pageHeight - 50) {
      pdf.addPage();
      yPos = margin;
      // Redraw table header on new page
      xPos = margin;
      colHeaders.forEach((header, i) => {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(xPos, yPos, colWidths[i], 7, 'FD');
        pdf.text(header, xPos + colWidths[i] / 2, yPos + 4.5, { align: 'center' });
        xPos += colWidths[i];
      });
      yPos += 7;
    }
    
    // Very light alternating row colors
    if (index % 2 === 1) {
      pdf.setFillColor(253, 253, 253);
      pdf.rect(margin, yPos, contentWidth, rowHeight, 'F');
    }
    
    xPos = margin;
    
    // Item number
    pdf.text((index + 1).toString(), xPos + colWidths[0] / 2, yPos + 5, { align: 'center' });
    xPos += colWidths[0];
    
    // Product name with text wrapping
    const productName = item.product_name.split('|')[0]?.trim() || '';
    const maxProductName = colWidths[1] - 2;
    const splitName = pdf.splitTextToSize(productName, maxProductName);
    pdf.text(splitName, xPos + 1, yPos + 3);
    xPos += colWidths[1];
    
    // SKU
    pdf.text(item.product_sku || '-', xPos + colWidths[2] / 2, yPos + 5, { align: 'center' });
    xPos += colWidths[2];
    
    // Quantity
    pdf.text(item.quantity.toString(), xPos + colWidths[3] / 2, yPos + 5, { align: 'center' });
    xPos += colWidths[3];
    
    // Weight
    pdf.text(`${(weight * item.quantity).toFixed(2)}`, xPos + colWidths[4] / 2, yPos + 5, { align: 'center' });
    xPos += colWidths[4];
    
    if (includePrices) {
      // Price
      pdf.text(`$${item.unit_price.toFixed(2)}`, xPos + colWidths[5] / 2, yPos + 5, { align: 'center' });
      xPos += colWidths[5];
      // Subtotal
      pdf.text(`$${item.subtotal.toFixed(2)}`, xPos + colWidths[6] / 2, yPos + 5, { align: 'center' });
    }
    
    // Draw row border
    pdf.setDrawColor(222, 226, 230);
    pdf.rect(margin, yPos, contentWidth, rowHeight, 'S');
    
    yPos += rowHeight;
  });

  yPos += 3;

  // Totals section - Light green background
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = order.items.reduce((sum, item) => {
    const weight = item.weight || item.product_weight || 0;
    return sum + (weight * item.quantity);
  }, 0);
  const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  pdf.setFillColor(240, 248, 240);
  pdf.setDrawColor(180, 200, 180);
  pdf.rect(margin, yPos, contentWidth, 18, 'FD');
  
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(0, 0, 0);
  pdf.text(`${l.totalQty}: ${totalQty}`, margin + 3, yPos + 6);
  pdf.text(`${l.totalWeight}: ${totalWeight.toFixed(2)} m`, margin + 3, yPos + 12);
  if (includePrices) {
    pdf.text(`${l.totalAmount}: $${totalAmount.toFixed(2)}`, margin + 80, yPos + 6);
  }
  yPos += 21;

  // Notes section - Very light yellow
  if (order.notes) {
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${l.notes}:`, margin, yPos);
    yPos += 5;
    pdf.setFont('helvetica', 'normal');
    const splitNotes = pdf.splitTextToSize(order.notes, contentWidth - 4);
    const notesHeight = splitNotes.length * 4.5 + 3;
    pdf.setFillColor(255, 255, 240);
    pdf.setDrawColor(240, 240, 200);
    pdf.rect(margin, yPos - 2, contentWidth, notesHeight, 'FD');
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
    pdf.text(`Page ${i} / ${pageCount}`, pageWidth - margin - 10, pageHeight - 10, { align: 'right' });
    pdf.text(`Order: ${order.id.slice(0, 8).toUpperCase()}`, margin, pageHeight - 10);
  }

  // Save PDF
  const fileNameSuffix = includePrices ? l.withPrices : l.withoutPrices;
  const filename = `Order_${order.id.slice(0, 8)}_${(customer?.name || 'Order').replace(/\s+/g, '_')}_${fileNameSuffix}.pdf`;
  pdf.save(filename);
}
