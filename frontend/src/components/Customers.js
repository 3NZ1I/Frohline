import React, { useState, useEffect } from 'react';
import { customersApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

function Customers() {
  const { language, t } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customersApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handleOpenModal = (customer = null) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData(customer);
    } else {
      setEditingCustomer(null);
      setFormData({ name: '', email: '', phone: '', company: '', address: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, formData);
      } else {
        await customersApi.create(formData);
      }
      handleCloseModal();
      loadCustomers();
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersApi.delete(id);
        loadCustomers();
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  // Translations
  const labels = {
    en: {
      title: '👥 Customers',
      addCustomer: '➕ Add Customer',
      name: 'Name',
      company: 'Company',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      actions: 'Actions',
      noCustomers: 'No customers found',
      edit: 'Edit',
      delete: 'Delete',
      editCustomer: 'Edit Customer',
      addCustomerModal: 'Add Customer',
      cancel: 'Cancel',
      update: 'Update',
      create: 'Create',
      confirmDelete: 'Are you sure you want to delete this customer?',
    },
    tr: {
      title: '👥 Müşteriler',
      addCustomer: '➕ Müşteri Ekle',
      name: 'Ad',
      company: 'Şirket',
      email: 'E-posta',
      phone: 'Telefon',
      address: 'Adres',
      actions: 'İşlemler',
      noCustomers: 'Müşteri bulunamadı',
      edit: 'Düzenle',
      delete: 'Sil',
      editCustomer: 'Müşteriyi Düzenle',
      addCustomerModal: 'Müşteri Ekle',
      cancel: 'İptal',
      update: 'Güncelle',
      create: 'Oluştur',
      confirmDelete: 'Bu müşteriyi silmek istediğinizden emin misiniz?',
    },
    ar: {
      title: '👥 العملاء',
      addCustomer: '➕ إضافة عميل',
      name: 'الاسم',
      company: 'الشركة',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      address: 'العنوان',
      actions: 'الإجراءات',
      noCustomers: 'لا يوجد عملاء',
      edit: 'تعديل',
      delete: 'حذف',
      editCustomer: 'تعديل العميل',
      addCustomerModal: 'إضافة عميل',
      cancel: 'إلغاء',
      update: 'تحديث',
      create: 'إنشاء',
      confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا العميل؟',
    },
  };

  const l = labels[language] || labels.en;
  const isRTL = language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <h2>{l.title}</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          {l.addCustomer}
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" dir={isRTL ? 'rtl' : 'ltr'}>
              <thead>
                <tr>
                  <th>{l.name}</th>
                  <th>{l.company}</th>
                  <th>{l.email}</th>
                  <th>{l.phone}</th>
                  <th>{l.address}</th>
                  <th>{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      {l.noCustomers}
                    </td>
                  </tr>
                ) : (
                  customers.map(customer => (
                    <tr key={customer.id}>
                      <td><strong>{customer.name}</strong></td>
                      <td>{customer.company || '-'}</td>
                      <td>{customer.email || '-'}</td>
                      <td>{customer.phone || '-'}</td>
                      <td>{customer.address || '-'}</td>
                      <td dir="ltr">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleOpenModal(customer)}
                        >
                          {l.edit}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(customer.id)}
                        >
                          {l.delete}
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

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCustomer ? l.editCustomer : l.addCustomerModal}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{l.name} *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{l.company}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{l.email}</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{l.phone}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{l.address}</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer" dir="ltr">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    {l.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingCustomer ? l.update : l.create}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
