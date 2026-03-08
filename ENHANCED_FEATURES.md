# Enhanced Order Management Features

## Overview

The system now includes advanced order management features:

1. ✅ **Fixed Sidebar** - Professional stationary left panel
2. ✅ **Professional Language Selector** - Enhanced UI with current language indicator
3. ✅ **Weight Calculation** - Real-time total weight during order creation
4. ✅ **Item Editing** - Edit quantity and price inline during order creation
5. ✅ **XLSX Export** - Download order forms with/without prices
6. ✅ **Brand Logos** - Visual sub-brand selection

---

## 1. Fixed Sidebar

### Features
- **Stationary Position**: Sidebar remains fixed on the left (or right for Arabic)
- **Scrollable Content**: Navigation scrolls independently
- **Responsive Layout**: Main content adjusts automatically
- **RTL Support**: Mirrors to right side for Arabic language

### Implementation
```css
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  z-index: 1000;
}

.main-content {
  margin-left: 250px;
}
```

---

## 2. Professional Language Selector

### Features
- **Located**: Bottom of sidebar with separator
- **Visual Feedback**: Active language highlighted
- **Current Language Indicator**: Shows selected language below buttons
- **Icons**: Flag emojis for quick recognition
- **Tooltips**: Hover shows language name

### Usage
Click TR/EN/AR buttons to switch languages instantly.

---

## 3. Weight Calculation

### Real-Time Calculation
- **Per Item**: Shows weight for each product line
- **Total Weight**: Displayed in header badge and summary
- **Auto-Update**: Recalculates when quantity changes

### Display Locations
1. **Order Items Header**: Shows total weight badge
2. **Items Table**: Weight column for each product
3. **Order Summary**: Total weight highlighted

### Formula
```javascript
totalWeight = Σ(item.weight × item.quantity)
```

---

## 4. Item Editing During Order Creation

### Editable Fields
- **Quantity**: Inline input field in table
- **Unit Price**: Inline input field in table
- **Auto-Calculation**: Subtotal updates automatically

### How to Edit
1. Add products to order
2. In the items table, click on quantity or price field
3. Type new value
4. Subtotal updates automatically

### Code Example
```javascript
const handleUpdateItem = (index, field, value) => {
  const newItems = [...items];
  const item = { ...newItems[index] };
  
  if (field === 'quantity') {
    item.quantity = parseInt(value);
    item.subtotal = item.quantity × item.unit_price;
  } else if (field === 'unit_price') {
    item.unit_price = parseFloat(value);
    item.subtotal = item.quantity × item.unit_price;
  }
  
  newItems[index] = item;
};
```

---

## 5. XLSX Export (CSV Format)

### Two Export Options

#### 📊 XLSX 💰 (With Prices)
- Includes all columns: Product, SKU, Qty, Weight, **Unit Price, Subtotal**
- Shows total amount at bottom
- File suffix: `_with_prices`

#### 📊 XLSX (Without Prices)
- Includes: Product, SKU, Qty, Weight
- **No pricing information**
- File suffix: `_no_prices`
- Useful for warehouse/packing slips

### Export Includes
- Order header (Customer, Brand, Date, Status)
- All line items
- Total quantity
- Total weight
- Total amount (if with prices)
- Order notes

### File Naming
```
Order_{CustomerName}_{with_prices|no_prices}_{timestamp}.csv
```

### How to Use
1. Create order with items
2. Click **📊 XLSX 💰** or **📊 XLSX** button
3. File downloads automatically
4. Open in Excel, Google Sheets, etc.

---

## 6. Brand Logos

### Adding Your Brand Images

#### Step 1: Copy Images to Project
Place your brand logo images in:
```
frontend/public/brands/
```

Supported formats: `.svg`, `.png`, `.jpg`

#### Step 2: Update Configuration
Edit `frontend/src/data/subBrands.js`:

```javascript
{
  id: 'yourbrand',
  name: {
    tr: 'Marka Adı TR',
    en: 'Brand Name EN',
    ar: 'اسم العلامة التجارية',
  },
  logo: '/brands/yourbrand-logo.png',
  color: '#hexcolor',
}
```

#### Step 3: Restart
```bash
docker restart oms-frontend
```

### Current Brands
- Frohline (Blue)
- Aluplast (Orange)
- Profine (Green)
- Veka (Pink)
- Rehau (Red)
- Other (Gray)

---

## User Guide

### Creating an Order with All Features

1. **Navigate** to "New Order" (Yeni Sipariş)
2. **Select Sub-Brand** by clicking on brand card
3. **Select Customer** from dropdown
4. **Add Products**:
   - Select product from dropdown
   - Enter quantity
   - Click "Add Product"
5. **Edit Items** (if needed):
   - Change quantity in table
   - Adjust unit price
   - Remove items with × button
6. **Review Summary**:
   - Check total weight
   - Check total amount
7. **Export** (optional):
   - Click 📊 XLSX 💰 for full order form
   - Click 📊 XLSX for no-price version
8. **Save Order**

---

## Technical Details

### Files Modified

#### Frontend
- `src/App.js` - Fixed sidebar layout
- `src/components/OrderForm.js` - All new features
- `src/context/LanguageContext.js` - Translation keys
- `src/index.css` - Fixed sidebar styles
- `src/utils/excelExport.js` - NEW: Export functionality
- `src/data/subBrands.js` - Brand configuration
- `public/brands/*.svg` - Brand logos

#### Backend
- `server.js` - sub_brand_id and weight support

### Database Schema
```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  sub_brand_id TEXT,
  status TEXT,
  total_amount REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  weight REAL,
  ...
);
```

---

## Troubleshooting

### Sidebar not fixed?
- Clear browser cache
- Check CSS loaded: `index.css`

### Export not working?
- Check browser pop-up blocker
- Verify items added to order

### Weight showing 0?
- Ensure products have weight in database
- Check migration ran successfully

### Brand logos not showing?
- Verify files in `public/brands/`
- Check file paths in `subBrands.js`
- Look for 404 errors in Network tab

---

## Future Enhancements

- [ ] Actual XLSX format (not CSV)
- [ ] Email order form
- [ ] Print order form
- [ ] Custom export templates
- [ ] Bulk import products
- [ ] Weight-based shipping calculation
