import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { subBrands, getSubBrandName } from '../data/subBrands';
import { useLanguage } from '../context/LanguageContext';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

function Analytics() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState(null);
  const [brands, setBrands] = useState(null);
  const [customers, setCustomers] = useState(null);
  const [trends, setTrends] = useState(null);
  const [trendPeriod, setTrendPeriod] = useState('daily');

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

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📊 Analytics Dashboard</h2>
        <div className="btn-group" role="group">
          <button
            className={`btn btn-sm ${trendPeriod === 'daily' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('daily')}
          >
            Daily
          </button>
          <button
            className={`btn btn-sm ${trendPeriod === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            className={`btn btn-sm ${trendPeriod === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTrendPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalOrders || 0}</h3>
              <p className="card-text">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{formatCurrency(overview?.totalRevenue || 0)}</h3>
              <p className="card-text">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalProducts || 0}</h3>
              <p className="card-text">Products</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card bg-warning text-dark h-100">
            <div className="card-body text-center">
              <h3 className="display-4">{overview?.totalCustomers || 0}</h3>
              <p className="card-text">Customers</p>
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
              <h5 className="mb-0">Orders by Status</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={overview?.ordersByStatus?.map(s => ({
                      name: s.status,
                      value: s.count,
                      revenue: s.revenue,
                    })) || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(overview?.ordersByStatus || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [
                    `${value} orders (${formatCurrency(props.payload.revenue)})`,
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
              <h5 className="mb-0">Order Trends ({trendPeriod})</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends?.orderTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="order_count" name="Orders" stroke="#8884d8" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#82ca9d" strokeWidth={2} />
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
              <h5 className="mb-0">Top Products by Revenue</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={products?.topProductsByRevenue?.slice(0, 10) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="sku" tick={{ fontSize: 10 }} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => name === 'total_revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Bar dataKey="total_revenue" name="Revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sales by Brand */}
        <div className="col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Sales by Brand</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(brands?.salesByBrand || []).map(b => ({
                  name: getSubBrandName(b.sub_brand_id, language),
                  orders: b.order_count,
                  revenue: b.total_revenue,
                })) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value, name) => name === 'revenue' ? formatCurrency(value) : value} />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenue" fill="#82ca9d" />
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
              <h5 className="mb-0">Top Customers</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Company</th>
                      <th>Orders</th>
                      <th>Total Spent</th>
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
                        <td colSpan="4" className="text-center text-muted">No customer data yet</td>
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
              <h5 className="mb-0">⚠️ Low Stock Alerts</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Stock</th>
                      <th>Price</th>
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
                        <td colSpan="4" className="text-center text-muted">All products well stocked</td>
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
          <h5 className="mb-0">Recent Orders</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(overview?.recentOrders || []).map((order) => (
                  <tr key={order.id}>
                    <td><small className="font-monospace">{order.id.slice(0, 8)}...</small></td>
                    <td>{order.customer_name}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {order.status}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total_amount)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(overview?.recentOrders || []).length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted">No orders yet</td>
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
