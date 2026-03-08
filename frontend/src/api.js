import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const productsApi = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  bulkDelete: (ids) => api.post('/products/bulk-delete', { ids }),
  export: () => api.get('/products/export', { responseType: 'blob' }),
  import: (products) => api.post('/products/import', { products }),
};

export const ordersApi = {
  getAll: (status) => {
    const result = api.get('/orders', status ? { params: { status } } : {});
    console.log('API getAll orders result:', result);
    return result;
  },
  getById: (id) => {
    const result = api.get(`/orders/${id}`);
    console.log('API getById order:', result);
    return result;
  },
  create: (data) => {
    console.log('API create order with data:', data);
    const result = api.post('/orders', data);
    console.log('API create order response:', result);
    return result;
  },
  update: (id, data) => {
    console.log('API update order', id, 'with data:', data);
    const result = api.put(`/orders/${id}`, data);
    console.log('API update order response:', result);
    return result;
  },
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export default api;
