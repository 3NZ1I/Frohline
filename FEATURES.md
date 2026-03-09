# Frohline OMS - Complete Feature Documentation

## 📋 Table of Contents

1. [Order Management](#order-management)
2. [Product Management](#product-management)
3. [Customer Management](#customer-management)
4. [Sub-Brand System](#sub-brand-system)
5. [Export/Import Features](#exportimport-features)
6. [Multi-Language Support](#multi-language-support)
7. [Analytics Dashboard](#analytics-dashboard)

---

## Order Management

### Features
- **Create Orders**: Add new orders with customer, sub-brand, and multiple products
- **Edit Orders**: Modify existing orders before completion
- **Order Status**: Track orders through workflow (Pending → In Progress → Completed)
- **Order Filtering**: Filter by status (All, Pending, In Progress, Completed, Cancelled)
- **Weight Calculation**: Automatic total weight calculation based on product weights
- **Price Calculation**: Real-time subtotal and total amount calculation
- **XLSX Export**: Download order forms as Excel files

### Order Workflow
```
Pending → In Progress → Completed
                    ↓
                Cancelled
```

### Creating an Order

1. Navigate to "New Order" from sidebar
2. Select customer from dropdown
3. Select sub-brand (visual selector with logo)
4. Add products:
   - Choose product from dropdown
   - Enter quantity (1-999)
   - Click "+ Add Product"
   - Repeat for multiple products
5. Review order summary:
   - Total quantity
   - Total weight (kg)
   - Total amount ($)
6. Add optional notes
7. Click "Create Order"

### Editing an Order

1. Find order in Orders List
2. Click ✏️ (Edit) button
3. Modify any field:
   - Customer
   - Sub-brand
   - Products (add/remove/update quantities)
   - Status
   - Notes
4. Click "💾 Save Changes" or "📊 Save & Export"

### Order Actions

From the orders list, each order has these actions:

| Button | Action | Description |
|--------|--------|-------------|
| ✏️ | Edit | Open order in edit mode |
| 📊 XLSX | Export | Download order as Excel file |
| ✓ | Complete | Mark as completed (if not completed/cancelled) |
| × | Delete | Remove order permanently |

---

## Product Management

### Features
- **CRUD Operations**: Create, Read, Update, Delete products
- **Multi-language Names**: Turkish, English, Arabic names in single field
- **Weight Tracking**: Each product has weight in kg
- **Stock Management**: Track inventory levels
- **SKU Management**: Unique stock keeping units
- **Bulk Operations**: Multi-select and batch actions

### Product Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Name | Text | Yes | Format: "TR \| EN \| AR" |
| Description | Text | No | Product description |
| SKU | Text | No | Stock keeping unit code |
| Weight | Number | No | Weight in kg |
| Price | Number | Yes | Unit price in USD |
| Stock | Integer | Yes | Available quantity |

### Bulk Operations

#### Multi-Select
1. Click checkboxes next to products
2. Select all using header checkbox
3. Bulk action toolbar appears

#### Delete Selected
1. Select products to delete
2. Click "🗑️ Delete Selected"
3. Confirm deletion
4. All selected products are removed

#### Export Selected
1. Select products to export
2. Click "📊 Export Selected"
3. XLSX file downloads with selected products only

### Export All Products

1. Go to Products page
2. Click "📥 Export All Products"
3. File downloads: `products-YYYY-MM-DD.xlsx`

### Import Products

1. Prepare XLSX file with columns:
   - Name (TR | EN | AR)
   - Description
   - SKU
   - Weight (kg)
   - Price
   - Stock
2. Go to Products page
3. Click "📤 Import Products"
4. Select XLSX file
5. Confirm import count
6. Products are added to database

---

## Customer Management

### Features
- **Customer Directory**: Centralized customer database
- **Company Information**: Store customer company details
- **Contact Details**: Email and phone storage
- **Address Management**: Full address storage

### Customer Fields

| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Email | Email | No |
| Phone | Text | No |
| Company | Text | No |
| Address | Text | No |

---

## Sub-Brand System

### Available Sub-Brands

The system includes 16 sub-brands with logos:

1. **Frohline** - Blue (#0066cc)
2. **Al Amir Plast** - Orange (#ff6600)
3. **Avalon** - Purple (#9b59b6)
4. **Golden House** - Gold (#f1c40f)
5. **Kartalpen** - Red (#e74c3c)
6. **Maria Plast** - Teal (#1abc9c)
7. **My House** - Blue (#3498db)
8. **Panorama** - Green (#2ecc71)
9. **PVC Sarayı** - Orange (#f39c12)
10. **Rosella** - Pink (#e91e63)
11. **Royal House** - Purple (#9c27b0)
12. **Seda Pen** - Cyan (#00bcd4)
13. **Sedoor** - Orange (#ff5722)
14. **Super House** - Grey (#607d8b)
15. **Wined Pen** - Brown (#795548)
16. **Other** - Grey (#666666)

### Visual Selector

- Dropdown with logo preview
- 50x50px logo display
- Fallback to colored initial if logo fails
- Brand name in selected language

### Brand Colors

Each brand has a signature color used for:
- UI highlights
- Status indicators
- Report branding

---

## Export/Import Features

### XLSX Export Formats

#### Order Export
- Customer name and company
- Sub-brand name
- Order date and status
- Itemized product list:
  - Product name
  - SKU
  - Quantity
  - Weight per item
  - Unit price (optional)
  - Subtotal (optional)
- Totals:
  - Total quantity
  - Total weight
  - Total amount

#### Product Export
- Name (combined TR | EN | AR)
- Description
- SKU
- Weight (kg)
- Price
- Stock

### XLSX Import Format

Columns required (case-insensitive):
- `Name (TR | EN | AR)` or `Name`
- `Description`
- `SKU`
- `Weight (kg)` or `Weight`
- `Price`
- `Stock`

### Export Options

**With Prices:**
- Includes unit price and subtotal columns
- For customer-facing documents

**Without Prices:**
- Hides pricing information
- For warehouse/packing use

---

## Multi-Language Support

### Supported Languages

| Language | Code | Direction | Flag |
|----------|------|-----------|------|
| Turkish | TR | LTR | 🇹🇷 |
| English | EN | LTR | 🇬🇧 |
| Arabic | AR | RTL | 🇸🇦 |

### Persistent Selection

- Language choice saved in browser
- Survives page refresh
- Per-user preference

### RTL Support

Arabic language includes:
- Right-to-left layout
- Mirrored sidebar
- Aligned text and forms
- Proper number formatting

### Translated Elements

- Navigation menu
- Form labels
- Button text
- Status labels
- Field placeholders
- Date formats
- Error messages

---

## Analytics Dashboard

### Overview Metrics

- **Total Orders**: Count and value
- **Orders by Status**: Visual breakdown
- **Revenue Trends**: Daily/weekly/monthly
- **Top Customers**: By order volume and value

### Product Analytics

- **Best Sellers**: Top products by quantity
- **Revenue Leaders**: Top products by value
- **Stock Alerts**: Low stock warnings
- **Weight Analysis**: Shipping weight trends

### Customer Insights

- **Order Frequency**: Repeat customer rate
- **Average Order Value**: Per customer
- **Customer Growth**: New vs returning

### Brand Performance

- **Sales by Brand**: Revenue per sub-brand
- **Popular Brands**: Order count by brand
- **Brand Trends**: Performance over time

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New Order |
| `Ctrl + F` | Search/Filter |
| `Ctrl + S` | Save (in forms) |
| `Esc` | Close modal |

---

## Data Validation

### Order Validation
- Customer required
- At least one product required
- Quantity must be > 0
- Price must be >= 0

### Product Validation
- Name required
- Price required and > 0
- Stock must be >= 0
- Weight must be >= 0
- SKU must be unique

### Customer Validation
- Name required
- Email must be valid format
- Phone format validated

---

## Security Features

- **Input Sanitization**: All user inputs sanitized
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: React escapes outputs by default
- **CORS Configuration**: Restricted to frontend origin

---

## Performance Optimizations

- **Database Indexes**: On order status and customer ID
- **Lazy Loading**: Components loaded on demand
- **Memoization**: Expensive calculations cached
- **Pagination**: Large datasets paginated

---

## Backup & Recovery

### Database Backup

```bash
# Copy database file
docker cp oms-backend:/app/data/orders.db ./backup/orders-$(date +%Y%m%d).db
```

### Restore Database

```bash
# Stop containers
docker-compose down

# Replace database
cp ./backup/orders-20260308.db backend/data/orders.db

# Restart
docker-compose up -d
```

---

## Version History

### v1.0.0 (Current)
- Order management with sub-brands
- Product bulk operations
- XLSX export/import
- Multi-language (TR/EN/AR)
- Visual brand selector
- Weight tracking
- Analytics dashboard (planned)

---

## Future Enhancements

- [ ] Analytics dashboard with charts
- [ ] User authentication
- [ ] Role-based access control
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Barcode scanning
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Automated backups
- [ ] Multi-currency support
