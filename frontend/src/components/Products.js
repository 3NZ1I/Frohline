import React, { useState, useEffect, useRef } from 'react';
import { productsApi } from '../api';
import { useLanguage } from '../context/LanguageContext';
import * as XLSX from 'xlsx';

function Products() {
  const { language, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    price: '',
    stock: '',
    weight: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        price: product.price?.toString() || '',
        stock: product.stock?.toString() || '',
        weight: product.weight?.toString() || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', sku: '', price: '', stock: '', weight: '' });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        stock: parseInt(formData.stock) || 0,
        weight: parseFloat(formData.weight) || 0,
      };
      if (editingProduct) {
        await productsApi.update(editingProduct.id, data);
      } else {
        await productsApi.create(data);
      }
      handleCloseModal();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsApi.delete(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Multi-select handlers
  const toggleSelectProduct = (id) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
    setSelectAll(newSelected.size === products.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts(new Set());
      setSelectAll(false);
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) {
      return;
    }

    try {
      await productsApi.bulkDelete(Array.from(selectedProducts));
      setSelectedProducts(new Set());
      setSelectAll(false);
      loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Error deleting products');
    }
  };

  // Export to XLSX
  const handleExport = async () => {
    try {
      const response = await productsApi.export();
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting products');
    }
  };

  // Import from XLSX
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        alert('No data found in file');
        return;
      }

      if (!window.confirm(`Import ${jsonData.length} products? This will add them to your existing products.`)) {
        return;
      }

      const response = await productsApi.import(jsonData);
      alert(response.data.message);
      if (response.data.errors) {
        console.error('Import errors:', response.data.errors);
        alert(`Imported with ${response.data.errors.length} errors. Check console for details.`);
      }

      loadProducts();
      e.target.value = '';
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing products: ' + error.message);
    }
  };

  const handleExportSelected = async () => {
    if (selectedProducts.size === 0) {
      alert('No products selected');
      return;
    }

    try {
      const selectedData = products
        .filter(p => selectedProducts.has(p.id))
        .map(p => ({
          'Name (TR | EN | AR)': p.name,
          'Description': p.description || '',
          'SKU': p.sku || '',
          'Weight (kg)': p.weight || 0,
          'Price': p.price || 0,
          'Stock': p.stock || 0,
        }));

      const worksheet = XLSX.utils.json_to_sheet(selectedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Products');
      XLSX.writeFile(workbook, `selected-products-${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting selected products');
    }
  };

  // Translations
  const labels = {
    en: {
      title: '📦 Products',
      addProduct: '➕ Add Product',
      selected: 'product(s) selected',
      deleteSelected: '🗑️ Delete Selected',
      exportSelected: '📊 Export Selected',
      clearSelection: '✕ Clear Selection',
      exportAll: '📥 Export All Products',
      importProducts: '📤 Import Products',
      importHint: 'Supports XLSX format. Template columns: Name, Description, SKU, Weight, Price, Stock',
      sku: 'SKU',
      weight: 'Weight (kg)',
      price: 'Price',
      stock: 'Stock',
      actions: 'Actions',
      noProducts: 'No products found',
      edit: 'Edit',
      delete: 'Delete',
      editProduct: 'Edit Product',
      addProductModal: 'Add Product',
      name: 'Name (TR | EN | AR) *',
      namePlaceholder: 'Turkish | English | عربي',
      description: 'Description',
      stockQty: 'Stock Quantity',
      cancel: 'Cancel',
      update: 'Update',
      create: 'Create',
      confirmDelete: 'Are you sure you want to delete this product?',
      confirmBulkDelete: 'Are you sure you want to delete',
      noDataInFile: 'No data found in file',
      importConfirm: 'Import',
      productsQuestion: 'products? This will add them to your existing products.',
      noProductsSelected: 'No products selected',
      errorExportSelected: 'Error exporting selected products',
      errorImport: 'Error importing products:',
    },
    tr: {
      title: '📦 Ürünler',
      addProduct: '➕ Ürün Ekle',
      selected: 'ürün seçildi',
      deleteSelected: '🗑️ Seçilenleri Sil',
      exportSelected: '📊 Seçilenleri Dışa Aktar',
      clearSelection: '✕ Seçimi Temizle',
      exportAll: '📥 Tüm Ürünleri Dışa Aktar',
      importProducts: '📤 Ürünleri İçe Aktar',
      importHint: 'XLSX formatı desteklenir. Şablon sütunları: Ad, Açıklama, SKU, Ağırlık, Fiyat, Stok',
      sku: 'SKU',
      weight: 'Ağırlık (kg)',
      price: 'Fiyat',
      stock: 'Stok',
      actions: 'İşlemler',
      noProducts: 'Ürün bulunamadı',
      edit: 'Düzenle',
      delete: 'Sil',
      editProduct: 'Ürünü Düzenle',
      addProductModal: 'Ürün Ekle',
      name: 'Ad (TR | EN | AR) *',
      namePlaceholder: 'Türkçe | English | عربي',
      description: 'Açıklama',
      stockQty: 'Stok Miktarı',
      cancel: 'İptal',
      update: 'Güncelle',
      create: 'Oluştur',
      confirmDelete: 'Bu ürünü silmek istediğinizden emin misiniz?',
      confirmBulkDelete: 'Şu kadar ürünü silmek istediğinizden emin misiniz:',
      noDataInFile: 'Dosyada veri bulunamadı',
      importConfirm: 'İçe aktar',
      productsQuestion: 'ürün? Bu, mevcut ürünlerinize ekleyecektir.',
      noProductsSelected: 'Seçili ürün yok',
      errorExportSelected: 'Seçili ürünler dışa aktarılırken hata oluştu',
      errorImport: 'Ürünler içe aktarılırken hata:',
    },
    ar: {
      title: '📦 المنتجات',
      addProduct: '➕ إضافة منتج',
      selected: 'منتج محدد',
      deleteSelected: '🗑️ حذف المحدد',
      exportSelected: '📊 تصدير المحدد',
      clearSelection: '✕ مسح التحديد',
      exportAll: '📥 تصدير جميع المنتجات',
      importProducts: '📤 استيراد منتجات',
      importHint: 'يدعم تنسيق XLSX. أعمدة القالب: الاسم، الوصف، رمز المنتج، الوزن، السعر، المخزون',
      sku: 'رمز المنتج',
      weight: 'الوزن (كجم)',
      price: 'السعر',
      stock: 'المخزون',
      actions: 'الإجراءات',
      noProducts: 'لا توجد منتجات',
      edit: 'تعديل',
      delete: 'حذف',
      editProduct: 'تعديل المنتج',
      addProductModal: 'إضافة منتج',
      name: 'الاسم (TR | EN | AR) *',
      namePlaceholder: 'Turkish | English | عربي',
      description: 'الوصف',
      stockQty: 'كمية المخزون',
      cancel: 'إلغاء',
      update: 'تحديث',
      create: 'إنشاء',
      confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا المنتج؟',
      confirmBulkDelete: 'هل أنت متأكد أنك تريد حذف',
      noDataInFile: 'لم يتم العثور على بيانات في الملف',
      importConfirm: 'استيراد',
      productsQuestion: 'منتج؟ سيتم إضافتها إلى منتجاتك الحالية.',
      noProductsSelected: 'لم يتم تحديد منتجات',
      errorExportSelected: 'خطأ في تصدير المنتجات المحددة',
      errorImport: 'خطأ في استيراد المنتجات:',
    },
  };

  const l = labels[language] || labels.en;
  const isRTL = language === 'ar';

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <h2>{l.title}</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          {l.addProduct}
        </button>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.size > 0 && (
        <div className="card mb-3 bg-light">
          <div className="card-body py-2">
            <div className="d-flex justify-content-between align-items-center" dir={isRTL ? 'rtl' : 'ltr'}>
              <span className="fw-semibold">
                {selectedProducts.size} {l.selected}
              </span>
              <div className="btn-group" role="group" dir="ltr">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleBulkDelete}
                >
                  {l.deleteSelected}
                </button>
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={handleExportSelected}
                >
                  {l.exportSelected}
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedProducts(new Set());
                    setSelectAll(false);
                  }}
                >
                  {l.clearSelection}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Actions */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <div className="d-flex gap-2" dir={isRTL ? 'rtl' : 'ltr'}>
            <button className="btn btn-sm btn-outline-success" onClick={handleExport}>
              {l.exportAll}
            </button>
            <button className="btn btn-sm btn-outline-primary" onClick={handleImportClick}>
              {l.importProducts}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            <small className="text-muted align-self-center">
              {l.importHint}
            </small>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover" dir={isRTL ? 'rtl' : 'ltr'}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>{l.name.split(' *')[0]}</th>
                  <th>{l.sku}</th>
                  <th>{l.weight}</th>
                  <th>{l.price}</th>
                  <th>{l.stock}</th>
                  <th>{l.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      {l.noProducts}
                    </td>
                  </tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} dir="ltr">
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <strong>{product.name}</strong>
                        </div>
                      </td>
                      <td><small className="font-monospace">{product.sku || '-'}</small></td>
                      <td>
                        {product.weight ? (
                          <span className="badge bg-info">{product.weight} kg</span>
                        ) : (
                          <span className="badge bg-secondary">-</span>
                        )}
                      </td>
                      <td>${product.price?.toFixed(2) || '0.00'}</td>
                      <td>
                        <span className={`badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td dir="ltr">
                        <button
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => handleOpenModal(product)}
                        >
                          {l.edit}
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product.id)}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? l.editProduct : l.addProductModal}
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">{l.name}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder={l.namePlaceholder}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{l.description}</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">{l.sku}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">{l.weight}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">{l.price} ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">{l.stockQty}</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" dir="ltr">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    {l.cancel}
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? l.update : l.create}
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

export default Products;
