import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useLanguage } from './context/LanguageContext';
import OrdersList from './components/OrdersList';
import OrderForm from './components/OrderForm';
import Customers from './components/Customers';
import Products from './components/Products';

function Sidebar() {
  const location = useLocation();
  const { t, language, setLanguage } = useLanguage();

  return (
    <div
      className="bg-dark text-white d-flex flex-column h-100"
      style={{
        width: '250px',
        overflowY: 'auto',
      }}
    >
      {/* Logo/Brand */}
      <div className="p-4 border-bottom border-secondary d-flex flex-column justify-content-center align-items-center">
        <img
          src="/company-logo.png"
          alt="Frohline"
          style={{
            maxHeight: '60px',
            maxWidth: '200px',
            objectFit: 'contain',
            marginBottom: '8px',
          }}
        />
        <small className="text-white-50">Order Management System</small>
      </div>

      {/* Navigation */}
      <nav className="nav flex-column p-3 flex-grow-1">
        <Link
          className={`nav-link rounded mb-2 d-flex align-items-center ${
            location.pathname === '/' ? 'active bg-danger' : 'text-white'
          }`}
          to="/"
          style={{ padding: '12px 15px', transition: 'all 0.2s' }}
        >
          <span className="me-2">📋</span>
          <span>{t('orders')}</span>
        </Link>

        <Link
          className={`nav-link rounded mb-2 d-flex align-items-center ${
            location.pathname === '/orders/new' ? 'active bg-danger' : 'text-white'
          }`}
          to="/orders/new"
          style={{ padding: '12px 15px', transition: 'all 0.2s' }}
        >
          <span className="me-2">➕</span>
          <span>{t('newOrder')}</span>
        </Link>

        <Link
          className={`nav-link rounded mb-2 d-flex align-items-center ${
            location.pathname === '/customers' ? 'active bg-danger' : 'text-white'
          }`}
          to="/customers"
          style={{ padding: '12px 15px', transition: 'all 0.2s' }}
        >
          <span className="me-2">👥</span>
          <span>{t('customers')}</span>
        </Link>

        <Link
          className={`nav-link rounded mb-2 d-flex align-items-center ${
            location.pathname === '/products' ? 'active bg-danger' : 'text-white'
          }`}
          to="/products"
          style={{ padding: '12px 15px', transition: 'all 0.2s' }}
        >
          <span className="me-2">📦</span>
          <span>{t('products')}</span>
        </Link>
      </nav>

      {/* Professional Language Selector */}
      <div className="p-4 border-top border-secondary bg-dark bg-opacity-75">
        <label className="text-white-50 small text-uppercase fw-semibold mb-2 d-block">
          🌐 Language / Dil
        </label>
        <div className="btn-group w-100" role="group">
          <button
            type="button"
            className={`btn btn-sm py-2 ${
              language === 'tr'
                ? 'btn-danger fw-semibold'  /* Red instead of blue */
                : 'btn-outline-light'
            }`}
            onClick={() => setLanguage('tr')}
            title="Türkçe"
          >
            🇹🇷 TR
          </button>
          <button
            type="button"
            className={`btn btn-sm py-2 ${
              language === 'en'
                ? 'btn-danger fw-semibold'  /* Red */
                : 'btn-outline-light'
            }`}
            onClick={() => setLanguage('en')}
            title="English"
          >
            🇬🇧 EN
          </button>
          <button
            type="button"
            className={`btn btn-sm py-2 ${
              language === 'ar'
                ? 'btn-danger fw-semibold'  /* Red */
                : 'btn-outline-light'
            }`}
            onClick={() => setLanguage('ar')}
            title="العربية"
          >
            🇸🇦 AR
          </button>
        </div>

        {/* Current language indicator */}
        <div className="mt-3 text-center">
          <small className="text-white-50">
            {language === 'tr' ? '🇹🇷 Türkçe' : language === 'en' ? '🇬🇧 English' : '🇸🇦 العربية'}
          </small>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { language } = useLanguage();
  
  return (
    <Router>
      <div className="container-fluid">
        {/* Fixed Sidebar */}
        <div style={{
          position: 'fixed',
          top: 0,
          [language === 'ar' ? 'right' : 'left']: 0,
          width: '250px',
          height: '100vh',
          zIndex: 1000,
        }}>
          <Sidebar />
        </div>
        
        {/* Main Content */}
        <div 
          style={{
            [language === 'ar' ? 'marginRight' : 'marginLeft']: '250px',
            [language === 'ar' ? 'marginLeft' : 'marginRight']: 0,
            direction: language === 'ar' ? 'rtl' : 'ltr',
            minHeight: '100vh',
          }}
        >
          <Routes>
            <Route path="/" element={<OrdersList />} />
            <Route path="/orders/new" element={<OrderForm />} />
            <Route path="/orders/edit/:id" element={<OrderForm />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
