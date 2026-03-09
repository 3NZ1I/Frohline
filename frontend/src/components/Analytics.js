import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { getSubBrandName } from '../data/subBrands';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

function Analytics() {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState(null);
  const [brands, setBrands] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('daily');
  const dashboardRef = useRef(null);

  useEffect(() => {
    loadAnalytics();
  }, [trendPeriod]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [overviewRes, productsRes, brandsRes, customersRes, trendsRes] = await Promise.all([
        API.get('/analytics/overview'),
        API.get('/analytics/products'),
        API.get('/analytics/brands'),
        API.get('/analytics/customers'),
        API.get('/analytics/trends', { params: { period: trendPeriod } }),
      ]);

      setOverview(overviewRes.data);
      setProducts(productsRes.data);
      setBrands(brandsRes.data);
      setCustomers(customersRes.data);
      setTrends(trendsRes.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setLoading(false);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

  const formatCurrency = (value) => {
    return `$${(value || 0).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      in_progress: '#17a2b8',
      completed: '#28a745',
      cancelled: '#dc3545',
    };
    return colors[status] || '#6c757d';
  };

  const getStatusTranslation = (status) => {
    const translations = {
      pending: t('pending') || 'Pending',
      in_progress: t('in_progress') || 'In Progress',
      completed: t('completed') || 'Completed',
      cancelled: t('cancelled') || 'Cancelled',
    };
    return translations[status] || status;
  };

  // Translations for dashboard labels
  const labels = {
    en: {
      title: '📊 Analytics Dashboard',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      totalOrders: 'Total Orders',
      totalRevenue: 'Total Revenue',
      totalProducts: 'Products',
      totalCustomers: 'Customers',
      ordersByStatus: 'Orders by Status',
      orderTrends: 'Order Trends',
      topProductsByRevenue: 'Top Products by Revenue',
      salesByBrand: 'Sales by Brand',
      topCustomers: 'Top Customers',
      lowStockAlerts: '⚠️ Low Stock Alerts',
      recentOrders: 'Recent Orders',
      customer: 'Customer',
      company: 'Company',
      orders: 'Orders',
      totalSpent: 'Total Spent',
      product: 'Product',
      sku: 'SKU',
      stock: 'Stock',
      price: 'Price',
      amount: 'Amount',
      date: 'Date',
      noData: 'No data yet',
      allStocked: 'All products well stocked',
      revenue: 'Revenue',
      qty: 'Quantity',
    },
    tr: {
      title: '📊 Analitik Panel',
      daily: 'Günlük',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      totalOrders: 'Toplam Sipariş',
      totalRevenue: 'Toplam Gelir',
      totalProducts: 'Ürünler',
      totalCustomers: 'Müşteriler',
      ordersByStatus: 'Duruma Göre Siparişler',
      orderTrends: 'Sipariş Trendleri',
      topProductsByRevenue: 'En Çok Gelir Getiren Ürünler',
      salesByBrand: 'Marka Bazında Satış',
      topCustomers: 'En İyi Müşteriler',
      lowStockAlerts: '⚠️ Düşük Stok Uyarıları',
      recentOrders: 'Son Siparişler',
      customer: 'Müşteri',
      company: 'Şirket',
      orders: 'Siparişler',
      totalSpent: 'Toplam Harcama',
      product: 'Ürün',
      sku: 'SKU',
      stock: 'Stok',
      price: 'Fiyat',
      amount: 'Tutar',
      date: 'Tarih',
      noData: 'Henüz veri yok',
      allStocked: 'Tüm ürünler iyi stoklanmış',
      revenue: 'Gelir',
      qty: 'Adet',
    },
    ar: {
      title: '📊 لوحة التحليلات',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      totalOrders: 'إجمالي الطلبات',
      totalRevenue: 'إجمالي الإيرادات',
      totalProducts: 'المنتجات',
      totalCustomers: 'العملاء',
      ordersByStatus: 'الطلبات حسب الحالة',
      orderTrends: 'اتجاهات الطلبات',
      topProductsByRevenue: 'أفضل المنتجات حسب الإيرادات',
      salesByBrand: 'المبيعات حسب العلامة التجارية',
      topCustomers: 'أفضل العملاء',
      lowStockAlerts: '⚠️ تنبيهات انخفاض المخزون',
      recentOrders: 'الطلبات الأخيرة',
      customer: 'العميل',
      company: 'الشركة',
      orders: 'الطلبات',
      totalSpent: 'إجمالي المنفق',
      product: 'المنتج',
      sku: 'رمز المنتج',
      stock: 'المخزون',
      price: 'السعر',
      amount: 'المبلغ',
      date: 'التاريخ',
      noData: 'لا توجد بيانات بعد',
      allStocked: 'جميع المنتجات مخزنة جيدًا',
      revenue: 'الإيرادات',
      qty: 'الكمية',
    },
  };

  const l = labels[language] || labels.en;

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Print/Export to PDF function
  const handlePrintPDF = async () => {
    const element = dashboardRef.current;
    if (!element) return;

    // Scroll to top to capture full content
    window.scrollTo(0, 0);

    const pdfLabels = {
      en: 'Analytics Report',
      tr: 'Analitik Raporu',
      ar: 'تقرير التحليلات',
    };

    const fileName = `${pdfLabels[language] || 'Analytics_Report'}_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      // Create canvas from dashboard
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1920,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 10mm from top
      let page = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;

      // Add additional pages if needed
      while (heightLeft > 0) {
        page++;
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight - 20;
      }

      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const isRTL = language === 'ar';

  // Prepare data for charts with translations
  const ordersByStatusData = (overview?.ordersByStatus || []).map(s => ({
    name: getStatusTranslation(s.status),
    value: s.count,
    revenue: s.revenue,
    status: s.status,
  }));

  const trendsData = (trends?.orderTrends || []).map(item => ({
    ...item,
    period: item.period,
  }));

  const topProductsData = (products?.topProductsByRevenue || []).slice(0, 10).map(p => ({
    sku: p.sku,
    name: p.name?.split('|')[0]?.trim() || p.name,
    total_revenue: p.total_revenue,
    qty_sold: p.qty_sold,
  }));

  const salesByBrandData = (brands?.salesByBrand || []).map(b => ({
    name: getSubBrandName(b.sub_brand_id, language),
    orders: b.order_count,
    revenue: b.total_revenue,
  }));

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} ref={dashboardRef}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <h2>{l.title}</h2>
        <div className="btn-group" role="group" dir="ltr">
          <button
            className="btn btn-sm btn-success"
            onClick={handlePrintPDF}
            title={language === 'ar' ? 'طباعة تقرير PDF' : language === 'tr' ? 'PDF Raporu Yazdır' : 'Print PDF Report'}
          >
            📄 {language === 'ar' ? 'طباعة PDF' : language === 'tr' ? 'PDF Yazdır' : 'Print PDF'}
          </button>
          <button
            className={`btn btn-sm ${trendPeriod === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('daily')}
          >
            {l.daily}
          </button>
          <button
            className={`btn btn-sm ${trendPeriod === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('weekly')}
          >
            {l.weekly}
          </button>
          <button
            className={`btn btn-sm ${trendPeriod === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('monthly')}
          >
            {l.monthly}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalOrders || 0}</h3>
              <p className="card-text">{l.totalOrders}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{formatCurrency(overview?.totalRevenue || 0)}</h3>
              <p className="card-text">{l.totalRevenue}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalProducts || 0}</h3>
              <p className="card-text">{l.totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalCustomers || 0}</h3>
              <p className="card-text">{l.totalCustomers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row mb-4">
        {/* Orders by Status */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.ordersByStatus}</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [
                    `${value} ${l.orders} (${formatCurrency(props.payload.revenue)})`,
                    name
                  ]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Order Trends */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.orderTrends} ({trendPeriod})</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="order_count" name={l.orders} stroke="#8884d8" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name={l.revenue} stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row mb-4">
        {/* Top Products */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.topProductsByRevenue}</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sku" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => name === 'total_revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Bar dataKey="total_revenue" name={l.revenue} fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales by Brand */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.salesByBrand}</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByBrandData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={isRTL ? 45 : -45} textAnchor={isRTL ? 'start' : 'end'} height={100} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Bar dataKey="revenue" name={l.revenue} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row mb-4">
        {/* Top Customers */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.topCustomers}</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr>
                      <th>{l.customer}</th>
                      <th>{l.company}</th>
                      <th>{l.orders}</th>
                      <th>{l.totalSpent}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(customers?.topCustomers || []).map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
                        <td>{c.company || '-'}</td>
                        <td>{c.order_count}</td>
                        <td>{formatCurrency(c.total_spent)}</td>
                      </tr>
                    ))}
                    {(customers?.topCustomers || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">{l.noData}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">{l.lowStockAlerts}</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr>
                      <th>{l.product}</th>
                      <th>{l.sku}</th>
                      <th>{l.stock}</th>
                      <th>{l.price}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(products?.lowStock || []).map((p, i) => (
                      <tr key={i}>
                        <td>{p.name?.split('|')[0]?.trim() || p.name}</td>
                        <td><small className="font-monospace">{p.sku}</small></td>
                        <td>
                          <span className={`badge ${p.stock < 50 ? 'bg-danger' : 'bg-warning'}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td>{formatCurrency(p.price)}</td>
                      </tr>
                    ))}
                    {(products?.lowStock || []).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center text-muted">{l.allStocked}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">{l.recentOrders}</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" dir={isRTL ? 'rtl' : 'ltr'}>
              <thead>
                <tr>
                  <th>{l.sku}</th>
                  <th>{l.customer}</th>
                  <th>Status</th>
                  <th>{l.amount}</th>
                  <th>{l.date}</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.recentOrders || []).map((order) => (
                  <tr key={order.id}>
                    <td><small className="font-monospace fw-bold">#{order.id.slice(0, 6).toUpperCase()}</small></td>
                    <td>{order.customer_name}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {getStatusTranslation(order.status)}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(overview?.recentOrders || []).length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">{l.noData}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
