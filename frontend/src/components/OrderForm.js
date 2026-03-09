import React, { useState, useEffect } from 'react';
import { ordersApi, customersApi, productsApi } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { subBrands, getSubBrandName } from '../data/subBrands';
import { exportOrderToXLSX } from '../utils/excelExport';
import SubBrandSelector from './SubBrandSelector';
import jsPDF from 'jspdf';

function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const { t, language } = useLanguage();

  const [formData, setFormData] = useState({
    customer_id: '',
    sub_brand_id: '',
    status: 'pending',
    notes: '',
    items: [],
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    loadCustomers();
    loadProducts();
    if (isEdit) {
      loadOrder();
    }
  }, [id, isEdit]);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrder = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getById(id);
      const order = response.data;
      // Map items to include weight from product_weight
      const itemsWithWeight = (order.items || []).map(item => ({
        ...item,
        weight: item.weight || item.product_weight || 0,
      }));
      setFormData({
        customer_id: order.customer_id,
        sub_brand_id: order.sub_brand_id || '',
        status: order.status,
        notes: order.notes || '',
        items: itemsWithWeight,
      });
    } catch (error) {
      console.error('Error loading order:', error);
    }
    setLoading(false);
  };

  const handleAddItem = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    const newItem = {
      product_id: product.id,
      product_name: product.name,
      product_sku: product.sku,
      quantity: parseInt(quantity),
      unit_price: product.price,
      weight: product.weight || 0,
      subtotal: product.price * parseInt(quantity),
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));

    setSelectedProduct('');
    setQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateItem = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index] };
      
      if (field === 'quantity') {
        item.quantity = parseInt(value) || 0;
        item.subtotal = item.quantity * item.unit_price;
      } else if (field === 'unit_price') {
        item.unit_price = parseFloat(value) || 0;
        item.subtotal = item.quantity * item.unit_price;
      }
      
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  // Calculate totals
  const totalAmount = formData.items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeight = formData.items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

  // Export to XLSX
  const exportToXLSX = (includePrices = true) => {
    const customer = customers.find(c => c.id === formData.customer_id);
    const brandName = formData.sub_brand_id ? getSubBrandName(formData.sub_brand_id, language) : 'N/A';

    exportOrderToXLSX(formData, formData.items, customer, brandName, language, includePrices);
  };

  // Export to PDF
  const exportToPDF = (includePrices = true) => {
    const customer = customers.find(c => c.id === formData.customer_id);
    const brandName = formData.sub_brand_id ? getSubBrandName(formData.sub_brand_id, language) : 'N/A';

    const pdfLabels = {
      en: { title: 'Order Form', customer: 'Customer', company: 'Company', brand: 'Brand', date: 'Date', status: 'Status', product: 'Product', sku: 'SKU', qty: 'Qty', weight: 'Weight', price: 'Price', subtotal: 'Subtotal', totalQty: 'Total Qty', totalWeight: 'Total Weight', totalAmount: 'Total Amount', notes: 'Notes', withPrices: 'with_prices', withoutPrices: 'without_prices' },
      tr: { title: 'Sipariş Formu', customer: 'Müşteri', company: 'Şirket', brand: 'Marka', date: 'Tarih', status: 'Durum', product: 'Ürün', sku: 'SKU', qty: 'Adet', weight: 'Ağırlık', price: 'Fiyat', subtotal: 'Ara Toplam', totalQty: 'Toplam Adet', totalWeight: 'Toplam Ağırlık', totalAmount: 'Toplam Tutar', notes: 'Notlar', withPrices: 'fiyatli', withoutPrices: 'fiyatsiz' },
      ar: { title: 'نموذج الطلب', customer: 'العميل', company: 'الشركة', brand: 'العلامة التجارية', date: 'التاريخ', status: 'الحالة', product: 'المنتج', sku: 'رمز المنتج', qty: 'الكمية', weight: 'الوزن', price: 'السعر', subtotal: 'المجموع الجزئي', totalQty: 'إجمالي الكمية', totalWeight: 'إجمالي الوزن', totalAmount: 'إجمالي المبلغ', notes: 'ملاحظات', withPrices: 'مع_الأسعار', withoutPrices: 'بدون_أسعار' },
    };

    const l = pdfLabels[language] || pdfLabels.en;
    const date = new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'tr' ? 'tr-TR' : 'en-US');

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
    pdf.text(`${l.status}: ${formData.status}`, 15, yPos);
    yPos += 10;

    // Products table header
    pdf.setFont(undefined, 'bold');
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
    pdf.line(15, yPos, 200, yPos);
    yPos += 6;

    // Products data
    pdf.setFont(undefined, 'normal');
    formData.items.forEach((item, index) => {
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

    // Totals
    yPos += 5;
    pdf.line(15, yPos, 200, yPos);
    yPos += 8;

    pdf.setFont(undefined, 'bold');
    pdf.text(`${l.totalQty}: ${totalAmount}`, 15, yPos);
    yPos += 6;
    pdf.text(`${l.totalWeight}: ${totalWeight.toFixed(2)} m`, 15, yPos);
    if (includePrices) {
      yPos += 6;
      pdf.text(`${l.totalAmount}: $${totalAmount.toFixed(2)}`, 15, yPos);
    }
    yPos += 10;

    // Notes
    if (formData.notes) {
      pdf.setFont(undefined, 'bold');
      pdf.text(`${l.notes}:`, 15, yPos);
      yPos += 6;
      pdf.setFont(undefined, 'normal');
      const splitNotes = pdf.splitTextToSize(formData.notes, 180);
      pdf.text(splitNotes, 15, yPos);
    }

    // Save PDF
    const customerName = customer?.name?.replace(/\s+/g, '_') || 'New';
    const priceSuffix = includePrices ? l.withPrices : l.withoutPrices;
    const filename = `Order_${customerName}_${priceSuffix}.pdf`;
    pdf.save(filename);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting order with sub_brand_id:', formData.sub_brand_id);
    console.log('Full form data:', formData);

    try {
      if (isEdit) {
        console.log('Updating order:', id);
        await ordersApi.update(id, formData);
      } else {
        console.log('Creating new order');
        await ordersApi.create(formData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving order:', error);
      console.error('Error response:', error.response?.data);
      alert('Error saving order. Please try again.');
    }
    setLoading(false);
  };

  if (loading && isEdit) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? '✏️ Edit Order' : '➕ New Order'}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← {t('back')}
          </button>
          {formData.items.length > 0 && (
            <>
              <div className="dropdown">
                <button
                  className="btn btn-success dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  📥 Export
                </button>
                <ul className="dropdown-menu">
                  <li>
                    <button className="dropdown-item" onClick={() => exportToXLSX(true)}>
                      📊 XLSX (With Prices)
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => exportToXLSX(false)}>
                      📊 XLSX (No Prices)
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={() => exportToPDF(true)}>
                      📄 PDF (With Prices)
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={() => exportToPDF(false)}>
                      📄 PDF (No Prices)
                    </button>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{t('orderItems')}</h5>
                <span className="badge bg-info">{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="card-body">
                {/* Sub Brand Image Dropdown */}
                <div className="mb-4">
                  <label className="form-label fw-bold">{t('subBrand')}</label>
                  <SubBrandSelector
                    value={formData.sub_brand_id}
                    onChange={(brandId) => setFormData({ ...formData, sub_brand_id: brandId })}
                    language={language}
                  />
                </div>

                {/* Product Selection */}
                <div className="row mb-3">
                  <div className="col-md-5">
                    <label className="form-label">{t('selectProduct')}</label>
                    <select
                      className="form-select"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      <option value="">-- {t('selectProduct')} --</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name.split('|')[0]?.trim()} - ${product.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">{t('quantity')}</label>
                    <input
                      type="number"
                      className="form-control"
                      value={quantity}
                      min="1"
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-outline-primary w-100"
                      onClick={handleAddItem}
                      disabled={!selectedProduct}
                    >
                      + {t('addProduct')}
                    </button>
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <table className="table table-bordered mt-3">
                    <thead>
                      <tr>
                        <th style={{width: '30%'}}>{t('productName').split(' ')[0]}</th>
                        <th style={{width: '15%'}}>{t('sku')}</th>
                        <th style={{width: '12%'}}>{t('quantity')}</th>
                        <th style={{width: '13%'}}>{t('weight')}</th>
                        <th style={{width: '15%'}}>{t('unitPrice')}</th>
                        <th style={{width: '15%'}}>{t('subtotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <small>{item.product_name.split('|')[0]?.trim()}</small>
                          </td>
                          <td><small className="font-monospace">{item.product_sku}</small></td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.quantity}
                              min="1"
                              onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                              style={{ width: '70px' }}
                            />
                          </td>
                          <td>
                            <small>{((item.weight || 0) * item.quantity).toFixed(2)} kg</small>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={item.unit_price.toFixed(2)}
                              min="0"
                              step="0.01"
                              onChange={(e) => handleUpdateItem(index, 'unit_price', e.target.value)}
                              style={{ width: '80px' }}
                            />
                          </td>
                          <td>
                            <strong>${item.subtotal.toFixed(2)}</strong>
                          </td>
                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(index)}
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-light">
                        <th colSpan="2" className="text-end">{t('total')}:</th>
                        <th>{formData.items.reduce((sum, item) => sum + item.quantity, 0)}</th>
                        <th>{totalWeight.toFixed(2)} kg</th>
                        <th colSpan="2">${totalAmount.toFixed(2)}</th>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">{t('orderDetails')}</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">{t('customer')} *</label>
                  <select
                    className="form-select"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                    required
                  >
                    <option value="">-- {t('selectCustomer')} --</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                        {customer.company && ` - ${customer.company}`}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.sub_brand_id && (
                  <div className="mb-3">
                    <label className="form-label">{t('subBrand')}</label>
                    <div className="p-3 bg-light rounded border text-center">
                      {(() => {
                        const brand = subBrands.find(b => b.id === formData.sub_brand_id);
                        if (brand?.logo) {
                          return (
                            <>
                              <img
                                src={brand.logo}
                                alt={getSubBrandName(brand.id, language)}
                                style={{
                                  maxHeight: '50px',
                                  maxWidth: '150px',
                                  objectFit: 'contain',
                                  marginBottom: '8px',
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div
                                style={{
                                  width: '50px',
                                  height: '50px',
                                  borderRadius: '8px',
                                  backgroundColor: brand.color,
                                  color: 'white',
                                  fontSize: '24px',
                                  fontWeight: 'bold',
                                  display: 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  margin: '0 auto 8px',
                                }}
                              >
                                {brand.name.tr.charAt(0)}
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                      <div className="fw-semibold">{getSubBrandName(formData.sub_brand_id, language)}</div>
                      <small className="text-muted">Selected Brand</small>
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">{t('status')}</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="pending">{t('pending')}</option>
                    <option value="in_progress">{t('in_progress')}</option>
                    <option value="completed">{t('completed')}</option>
                    <option value="cancelled">{t('cancelled')}</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">{t('notes')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">{t('orderSummary')}</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('subtotal')}:</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('totalWeight')}:</span>
                  <span className="fw-bold">{totalWeight.toFixed(2)} kg</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>{t('total')}:</strong>
                  <strong className="text-primary">${totalAmount.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || formData.items.length === 0}>
            {loading ? 'Saving...' : isEdit ? '💾 Save Changes' : t('createOrder')}
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn btn-success btn-lg"
              onClick={() => {
                const customer = customers.find(c => c.id === formData.customer_id);
                const brandName = formData.sub_brand_id ? getSubBrandName(formData.sub_brand_id, language) : 'N/A';
                exportOrderToXLSX(formData, formData.items, customer, brandName, language, true);
              }}
              disabled={formData.items.length === 0}
            >
              📊 Save & Export
            </button>
          )}
          <button type="button" className="btn btn-secondary btn-lg" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default OrderForm;
