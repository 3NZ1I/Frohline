import React, { useState, useEffect } from 'react';
import { ordersApi, customersApi } from '../api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { subBrands, getSubBrandName } from '../data/subBrands';
import { exportOrderToXLSX } from '../utils/excelExport';
import jsPDF from 'jspdf';

// Helper component to display brand logo with fallback
function BrandLogo({ brandId, language }) {
  const [imageError, setImageError] = useState(false);
  const brand = subBrands.find(b => b.id === brandId);

  if (!brand) return null;

  if (imageError || !brand.logo) {
    return (
      <div
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '6px',
          backgroundColor: brand.color,
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {brand.name.tr.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={brand.logo}
      alt={getSubBrandName(brand.id, language)}
      style={{
        width: '30px',
        height: '30px',
        objectFit: 'contain',
      }}
      onError={() => setImageError(true)}
    />
  );
}

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    loadOrders();
    loadCustomers();
  }, [filter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getAll(filter !== 'all' ? filter : null);
      console.log('Loaded orders:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setLoading(false);
  };

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'status-pending',
      in_progress: 'status-in_progress',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return (
      <span className={`badge badge-status ${badges[status] || 'bg-secondary'}`}>
        {t(status)}
      </span>
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersApi.delete(id);
        loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const exportOrder = async (orderId, includePrices = true, asPdf = false) => {
    try {
      const response = await ordersApi.getById(orderId);
      const order = response.data;
      const customer = customers.find(c => c.id === order.customer_id);
      const brandName = order.sub_brand_id ? getSubBrandName(order.sub_brand_id, language) : 'N/A';

      if (asPdf) {
        exportOrderAsPDF(order, customer, brandName, includePrices);
      } else {
        exportOrderToXLSX(
          { ...order, items: order.items },
          order.items,
          customer,
          brandName,
          language,
          includePrices
        );
      }
    } catch (error) {
      console.error('Error exporting order:', error);
      alert('Error exporting order. Please try again.');
    }
  };

  const exportOrderAsPDF = (order, customer, brandName, includePrices) => {
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
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 15;

    // Header
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text(l.title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Order info
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.text(`${l.customer}: ${customer?.name || ''}`, 15, yPos);
    yPos += 6;
    if (customer?.company) {
      pdf.text(`${l.company}: ${customer.company}`, 15, yPos);
      yPos += 6;
    }
    pdf.text(`${l.brand}: ${brandName}`, 15, yPos);
    yPos += 6;
    pdf.text(`${l.date}: ${date}`, 15, yPos);
    yPos += 6;
    pdf.text(`${l.status}: ${order.status}`, 15, yPos);
    yPos += 10;

    // Products table header
    pdf.setFont(undefined, 'bold');
    const tableStart = yPos;
    pdf.text('#', 15, yPos);
    pdf.text(l.product, 25, yPos);
    pdf.text(l.sku, 90, yPos);
    pdf.text(l.qty, 130, yPos);
    pdf.text(l.weight, 150, yPos);
    if (includePrices) {
      pdf.text(l.price, 170, yPos);
      pdf.text(l.subtotal, 190, yPos);
    }
    yPos += 6;

    // Draw header line
    pdf.line(15, yPos, 200, yPos);
    yPos += 6;

    // Products data
    pdf.setFont(undefined, 'normal');
    order.items.forEach((item, index) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 15;
      }
      const weight = item.weight || item.product_weight || 0;
      pdf.text((index + 1).toString(), 15, yPos);
      pdf.text(item.product_name.split('|')[0]?.trim() || '', 25, yPos);
      pdf.text(item.product_sku || '', 90, yPos);
      pdf.text(item.quantity.toString(), 130, yPos);
      pdf.text(`${(weight * item.quantity).toFixed(2)} m`, 150, yPos);
      if (includePrices) {
        pdf.text(`$${item.unit_price.toFixed(2)}`, 170, yPos);
        pdf.text(`$${item.subtotal.toFixed(2)}`, 190, yPos);
      }
      yPos += 6;
    });

    // Draw footer line
    yPos += 3;
    pdf.line(15, yPos, 200, yPos);
    yPos += 8;

    // Totals
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = order.items.reduce((sum, item) => {
      const weight = item.weight || item.product_weight || 0;
      return sum + (weight * item.quantity);
    }, 0);
    const totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

    pdf.setFont(undefined, 'bold');
    pdf.text(`${l.totalQty}: ${totalQty}`, 15, yPos);
    yPos += 6;
    pdf.text(`${l.totalWeight}: ${totalWeight.toFixed(2)} m`, 15, yPos);
    if (includePrices) {
      yPos += 6;
      pdf.text(`${l.totalAmount}: $${totalAmount.toFixed(2)}`, 15, yPos);
    }
    yPos += 10;

    // Notes
    if (order.notes) {
      pdf.setFont(undefined, 'bold');
      pdf.text(`${l.notes}:`, 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, 'normal');
      const splitNotes = pdf.splitTextToSize(order.notes, 180);
      pdf.text(splitNotes, 15, yPos);
    }

    // Save PDF
    const priceSuffix = includePrices ? l.withPrices : l.withoutPrices;
    const filename = `Order_${order.id.slice(0, 8)}_${customer?.name?.replace(/\s+/g, '_') || 'New'}_${priceSuffix}.pdf`;
    pdf.save(filename);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{t('ordersTitle')}</h2>
        <Link to="/orders/new" className="btn btn-primary">
          {t('newOrderBtn')}
        </Link>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              {t('allOrders') || 'All Orders'}
            </button>
            <button
              type="button"
              className={`btn ${filter === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
              onClick={() => setFilter('pending')}
            >
              {t('pending')}
            </button>
            <button
              type="button"
              className={`btn ${filter === 'in_progress' ? 'btn-info' : 'btn-outline-info'}`}
              onClick={() => setFilter('in_progress')}
            >
              {t('in_progress')}
            </button>
            <button
              type="button"
              className={`btn ${filter === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
              onClick={() => setFilter('completed')}
            >
              {t('completed')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>{t('orderId') || 'Order ID'}</th>
                    <th>{t('customer')}</th>
                    <th>{t('subBrand')}</th>
                    <th>{t('status')}</th>
                    <th>{t('amount')}</th>
                    <th>{t('created')}</th>
                    <th>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-4">
                        {t('noOrders')}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>
                          <small className="font-monospace fw-bold">#{order.id.slice(0, 6).toUpperCase()}</small>
                        </td>
                        <td>
                          <strong>{order.customer_name}</strong>
                          {order.customer_company && (
                            <div className="text-muted small">{order.customer_company}</div>
                          )}
                        </td>
                        <td>
                          {order.sub_brand_id ? (
                            <div className="d-flex align-items-center gap-2">
                              <BrandLogo brandId={order.sub_brand_id} language={language} />
                              <small className="text-muted">
                                {getSubBrandName(order.sub_brand_id, language)}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>{getStatusBadge(order.status)}</td>
                        <td>${order.total_amount?.toFixed(2) || '0.00'}</td>
                        <td>{new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="dropdown" style={{ direction: 'ltr' }}>
                            <button
                              className="btn btn-outline-success btn-sm dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              📥 Export
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => exportOrder(order.id, true, false)}
                                >
                                  📊 XLSX (With Prices)
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => exportOrder(order.id, false, false)}
                                >
                                  📊 XLSX (No Prices)
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => exportOrder(order.id, true, true)}
                                >
                                  📄 PDF (With Prices)
                                </button>
                              </li>
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => exportOrder(order.id, false, true)}
                                >
                                  📄 PDF (No Prices)
                                </button>
                              </li>
                            </ul>
                          </div>
                          <Link to={`/orders/edit/${order.id}`} className="btn btn-outline-primary btn-sm ms-1">
                            ✏️
                          </Link>
                          {order.status !== 'completed' && order.status !== 'cancelled' && (
                            <button
                              className="btn btn-outline-success btn-sm ms-1"
                              onClick={() => handleStatusChange(order.id, 'completed')}
                              title="Mark as completed"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            className="btn btn-outline-danger btn-sm ms-1"
                            onClick={() => handleDelete(order.id)}
                            title="Delete"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersList;
