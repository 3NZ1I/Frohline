import React, { useState, useEffect, useRef } from 'react';
import { subBrands, getSubBrandName } from '../data/subBrands';

function SubBrandSelector({ value, onChange, language }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedBrand = subBrands.find(b => b.id === value);

  return (
    <div className="sub-brand-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Selected Brand Display */}
      <div
        className="selected-brand"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 15px',
          border: '2px solid #dee2e6',
          borderRadius: '8px',
          backgroundColor: 'white',
          cursor: 'pointer',
          minHeight: '70px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedBrand ? (
            <>
              {selectedBrand.logo ? (
                <img
                  src={selectedBrand.logo}
                  alt={getSubBrandName(selectedBrand.id, language)}
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'contain',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '8px',
                  backgroundColor: selectedBrand.color,
                  color: 'white',
                  display: selectedBrand.logo ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                {selectedBrand.name.tr.charAt(0)}
              </div>
              <span style={{ fontWeight: '500', color: '#333' }}>
                {getSubBrandName(selectedBrand.id, language)}
              </span>
            </>
          ) : (
            <span style={{ color: '#6c757d' }}>Select Sub Brand...</span>
          )}
        </div>
        <span style={{ fontSize: '12px', color: '#6c757d' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className="brand-options"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '8px',
            backgroundColor: 'white',
            border: '2px solid #dee2e6',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
          }}
        >
          {subBrands.map(brand => (
            <div
              key={brand.id}
              onClick={() => {
                onChange(brand.id);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 15px',
                cursor: 'pointer',
                backgroundColor: value === brand.id ? '#e7f1ff' : 'white',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== brand.id) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== brand.id) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {/* Brand Logo/Placeholder */}
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={getSubBrandName(brand.id, language)}
                  style={{
                    width: '45px',
                    height: '45px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '6px',
                  backgroundColor: brand.color,
                  color: 'white',
                  display: brand.logo ? 'none' : 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                {brand.name.tr.charAt(0)}
              </div>
              
              {/* Brand Name */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {getSubBrandName(brand.id, language)}
                </div>
                {value === brand.id && (
                  <small style={{ color: '#0d6efd', fontSize: '11px' }}>
                    ✓ Selected
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SubBrandSelector;
