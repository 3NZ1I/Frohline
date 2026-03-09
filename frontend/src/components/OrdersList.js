import React, { useState, useEffect } from 'react';
import { ordersApi, customersApi } from '../api';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { subBrands, getSubBrandName } from '../data/subBrands';
import { exportOrderToXLSX } from '../utils/excelExport';

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

  const exportOrder = async (orderId) => {
    try {
      const response = await ordersApi.getById(orderId);
      const order = response.data;
      const customer = customers.find(c => c.id === order.customer_id);
      const brandName = order.sub_brand_id ? getSubBrandName(order.sub_brand_id, language) : 'N/A';
      
      // Fetch products to get weights
      const productsResponse = await customersApi.getAll(); // Reuse existing API call pattern
      
      // Map order items with weights
      const itemsWithWeight = order.items.map(item => ({
        ...item,
        weight: 0, // Weight not available in order items, would need product lookup
      }));
      
      exportOrderToXLSX(
        { ...order, items: itemsWithWeight },
        itemsWithWeight,
        customer,
        brandName,
        language,
        true
      );
    } catch (error) {
      console.error('Error exporting order:', error);
      alert('Error exporting order. Please try again.');
    }
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
                          <div className="btn-group btn-group-sm" role="group" style={{ direction: 'ltr' }}>
                            <Link to={`/orders/edit/${order.id}`} className="btn btn-outline-primary btn-sm">
                              ✏️
                            </Link>
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => exportOrder(order.id)}
                              title="Download XLSX"
                            >
                              📊 XLSX
                            </button>
                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                              <button
                                className="btn btn-outline-success btn-sm"
                                onClick={() => handleStatusChange(order.id, 'completed')}
                                title="Mark as completed"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(order.id)}
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
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
