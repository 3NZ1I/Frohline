# Frohline Order Management System

A comprehensive full-stack Order Management System for factory orders, built with React, Node.js, Express, and SQLite, containerized with Docker and exposed via Cloudflare Tunnel.

## 🌟 Features

### 📋 Orders Management
- View all orders with status filtering (All, Pending, In Progress, Completed, Cancelled)
- Create new orders with multiple products and sub-brand selection
- Edit existing orders with real-time weight and price calculations
- Update order status with one-click actions
- Delete orders
- **Export orders to XLSX or PDF** with/without prices
- **Sub-brand selection** with visual logo display for each order
- **PDF export** includes sub-brand logo and structured layout

### 👥 Customer Directory
- Add, edit, and delete customers
- Store complete customer details (name, company, email, phone, address)
- Quick customer selection when creating orders
- Full Turkish/Arabic/English translations

### 📦 Product Directory
- Add, edit, and delete products
- Product details (name in TR/EN/AR, SKU, description, price, stock, weight)
- Stock level indicators (green/yellow/red badges)
- **Bulk Operations:**
  - Multi-select products with checkboxes
  - Delete multiple products at once
  - Export all products or selected products to XLSX
  - Import products from XLSX file
- **59 Frohline profile products** pre-loaded with weights

### 🏭 Production Tracking
- **8 production lines** monitoring
- **Daily production reports** with:
  - Production type selection (59 types dropdown)
  - Auto-fill production speed
  - Expected vs Actual production (in meters)
  - Automatic difference calculation
  - Notes for each line
- **Filter reports** by period (All/Weekly/Monthly/Annual)
- **Multi-select reports** for bulk PDF export
- **View all submitted reports** with full details

### 📊 Analytics Dashboard
- **Overview Metrics:**
  - Total Orders count and value
  - Total Revenue
  - Total Products count
  - Total Customers count
- **Visual Charts:**
  - Orders by Status (Pie Chart)
  - Order Trends (Line Chart - Daily/Weekly/Monthly)
  - Top Products by Revenue (Bar Chart)
  - Sales by Brand (Bar Chart)
- **Tables:**
  - Top Customers by spending
  - Low Stock Alerts (< 100 units)
  - Recent Orders list
- **Production Analytics:**
  - Production trends chart (Expected vs Actual)
  - Line efficiency for all 8 lines
  - Top production types by volume
  - Recent production reports list

### 🌐 Multi-Language Support
- **Turkish (TR)** - Full translation with PDF transliteration
- **English (EN)** - Default language
- **Arabic (AR)** - Full translation with RTL layout and PDF transliteration
- Persistent language selection across sessions
- All UI elements, forms, and exports translated

### 🎨 Brand Management
- **16 sub-brands** with logos and colors:
  - Frohline, Al Amir Plast, Avalon, Golden House, Kartalpen
  - Maria Plast, My House, Panorama, PVC Sarayı, Rosella
  - Royal House, Seda Pen, Sedoor, Super House, Wined Pen, Other
- Visual sub-brand selector with logo preview
- Brand logos displayed in order lists
- Sub-brand logo included in PDF exports
- Color-coded UI elements per brand

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- Axios
- XLSX (SheetJS) for Excel export/import
- jsPDF for PDF generation
- html2canvas for PDF capture
- Recharts for analytics charts

### Backend
- Node.js
- Express.js
- Better-SQLite3
- UUID for unique IDs
- XLSX for backend exports

### DevOps
- Docker
- Docker Compose
- Cloudflare Tunnel (for public access)
- Named volumes for database persistence

## 🚀 Getting Started

### Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running with Docker

1. **Navigate to the project directory:**
   ```bash
   cd /home/bashar/order-management-system
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Start Cloudflare Tunnel:**
   ```bash
   ./start-cloudflare-tunnel.sh
   ```

4. **Access the application:**
   - **Frontend:** https://froh.bessar.work
   - **Backend API:** https://api1.bessar.work

5. **View logs:**
   ```bash
   docker-compose logs -f
   docker logs cloudflared-tunnel --tail 50 -f
   ```

### Stopping the Application

```bash
# Stop Docker services
docker-compose down

# Stop Cloudflare Tunnel
docker stop cloudflared-tunnel
```

⚠️ **Warning:** To remove the database (all data will be lost):
```bash
docker-compose down -v
```

## 📡 API Endpoints

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create customer |
| PUT | `/api/customers/:id` | Update customer |
| DELETE | `/api/customers/:id` | Delete customer |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/products/bulk-delete` | Delete multiple products |
| GET | `/api/products/export` | Export products to XLSX |
| POST | `/api/products/import` | Import products from XLSX |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | Get all orders (optional `?status=` filter) |
| GET | `/api/orders/:id` | Get order by ID with items |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id` | Update order |
| PATCH | `/api/orders/:id/status` | Update order status |
| DELETE | `/api/orders/:id` | Delete order |

### Production Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/production-reports` | Get all reports (optional `?date=` and `?limit=`) |
| GET | `/api/production-reports/:id` | Get report by ID |
| POST | `/api/production-reports` | Create new report |
| PUT | `/api/production-reports/:id` | Update report |
| DELETE | `/api/production-reports/:id` | Delete report |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Get overview metrics |
| GET | `/api/analytics/products` | Get product analytics |
| GET | `/api/analytics/brands` | Get brand analytics |
| GET | `/api/analytics/customers` | Get customer analytics |
| GET | `/api/analytics/trends` | Get order trends (optional `?period=`) |
| GET | `/api/analytics/production` | Get production analytics |

## 📁 Project Structure

```
order-management-system/
├── docker-compose.yml
├── start-cloudflare-tunnel.sh
├── PROJECT_MEMO.md              # Project documentation
├── README.md                    # This file
├── FEATURES.md                  # Detailed feature documentation
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js                # Main server (970 lines)
│   ├── migrate-products.js      # Product migration script
│   └── data/                    # Created at runtime
│       └── orders.db            # SQLite database
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   ├── index.html           # With Bootstrap JS
    │   └── brands/              # Sub-brand logo images
    └── src/
        ├── index.js
        ├── index.css
        ├── api.js               # API client
        ├── context/
        │   └── LanguageContext.js
        ├── utils/
        │   ├── excelExport.js   # XLSX export utilities
        │   └── pdfExport.js     # PDF export with transliteration
        ├── data/
        │   └── subBrands.js     # 16 sub-brands configuration
        └── components/
            ├── OrdersList.js    # Orders list with export dropdown
            ├── OrderForm.js     # Create/Edit order form
            ├── Customers.js     # Customer management
            ├── Products.js      # Product management with bulk ops
            ├── Analytics.js     # Analytics dashboard
            ├── ProductionDetails.js  # Production tracking
            └── SubBrandSelector.js   # Visual brand selector
```

## 📊 Database Schema

### Tables

**customers**
- id (TEXT, PK)
- name (TEXT)
- email (TEXT)
- phone (TEXT)
- company (TEXT)
- address (TEXT)
- created_at (DATETIME)

**products**
- id (TEXT, PK)
- name (TEXT) - Combined TR | EN | AR
- name_en (TEXT)
- name_ar (TEXT)
- description (TEXT)
- sku (TEXT)
- price (REAL)
- stock (INTEGER)
- weight (REAL)
- created_at (DATETIME)

**orders**
- id (TEXT, PK)
- customer_id (TEXT, FK)
- sub_brand_id (TEXT)
- status (TEXT) - pending, in_progress, completed, cancelled
- total_amount (REAL)
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)

**order_items**
- id (TEXT, PK)
- order_id (TEXT, FK)
- product_id (TEXT, FK)
- quantity (INTEGER)
- unit_price (REAL)
- subtotal (REAL)

**production_reports**
- id (TEXT, PK)
- report_date (TEXT)
- created_by (TEXT)
- created_at (DATETIME)
- line_1_type through line_8_type (TEXT)
- line_1_speed through line_8_speed (REAL)
- line_1_expected through line_8_expected (REAL)
- line_1_actual through line_8_actual (REAL)
- line_1_notes through line_8_notes (TEXT)

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)
- `DB_PATH` - Database path (default: ./data/orders.db)
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL (default: https://api1.bessar.work)

### Docker Volumes

- `backend-data` - Persistent database storage
- `./backend:/app` - Code volume for development (backend)
- `./frontend:/app` - Code volume for development (frontend)
- `/app/node_modules` - Excluded from volume mounts

## 📝 Usage Guide

### Creating an Order

1. Click "➕ New Order" in the sidebar
2. Select a customer from the dropdown
3. Select a sub-brand (logo will be displayed)
4. Add products:
   - Select product from dropdown
   - Enter quantity
   - Click "+ Add Product"
   - Repeat for multiple products
5. Review order summary:
   - Total quantity
   - Total weight (kg)
   - Total amount ($)
6. Add notes if needed
7. Click "Create Order"

### Exporting Orders

**From Orders List:**
1. Click "📥 Export" button on any order
2. Choose export format:
   - 📊 XLSX (With Prices)
   - 📊 XLSX (No Prices)
   - 📄 PDF (With Prices)
   - 📄 PDF (No Prices)

**From Order Edit Page:**
1. Open order in edit mode
2. Click "📥 Export" in header
3. Choose format as above

### Bulk Product Operations

1. Go to Products page
2. Select products using checkboxes
3. Use bulk action toolbar:
   - 🗑️ Delete Selected
   - 📊 Export Selected
4. Or use global actions:
   - 📥 Export All Products
   - 📤 Import Products (upload XLSX)

### Production Reporting

1. Go to "🏭 Production" in sidebar
2. Click "➕ New Report"
3. Select date and enter your name
4. For each production line:
   - Select production type (auto-fills speed)
   - Enter expected production (meters)
   - Enter actual production (meters)
   - Add notes if needed
5. Review totals and efficiency
6. Click "💾 Save Report"

### Viewing Production Reports

1. Go to "🏭 Production" → "📋 View Reports"
2. Filter by period (All/Weekly/Monthly/Annual)
3. Select reports using checkboxes
4. Click "📄 Export Selected as PDF" to download

## 🐛 Troubleshooting

### Backend not starting
```bash
docker-compose logs backend
docker-compose restart backend
```

### Frontend not loading
```bash
docker-compose logs frontend
docker-compose restart frontend
```

### Database reset
⚠️ **Warning:** This will delete all data!
```bash
docker-compose down -v
docker-compose up -d
```

### Restore products after database reset
```bash
docker exec oms-backend node /app/migrate-products.js
```

### Cloudflare Tunnel not connecting
```bash
# Check tunnel status
docker ps | grep cloudflared

# View tunnel logs
docker logs cloudflared-tunnel --tail 50 -f

# Restart tunnel
./start-cloudflare-tunnel.sh
```

### Port conflicts
Edit `docker-compose.yml` to change ports:
```yaml
ports:
  - "8080:3000"  # Frontend
  - "5001:5000"  # Backend
```

### PDF characters garbled (Turkish/Arabic)
This is expected - characters are transliterated:
- Turkish: İ→I, ş→s, ğ→g, ü→u, ö→o, ç→c
- Arabic: Full transliteration to English letters

## 📄 Export Formats

### XLSX Export
- Excel format (.xlsx)
- Includes all order/product data
- Optional: Include/exclude prices
- UTF-8 encoded for Turkish/Arabic support

### PDF Export
- Professional A4 format
- Sub-brand logo in top-right
- Structured table layout
- Cell borders and alternating row colors
- Light backgrounds for text visibility
- Page numbers in footer
- Optional: Include/exclude prices
- Turkish/Arabic text transliterated to English

## 🌍 Cloudflare Tunnel

### Configuration
- **Tunnel ID:** 90137fe9-7a2d-4159-a433-d1fdef193f83
- **Running as:** Docker container
- **Auto-restart:** Enabled

### Domains
| Service | Domain | Routes To |
|---------|--------|-----------|
| Frontend | froh.bessar.work | localhost:3000 |
| Backend API | api1.bessar.work | localhost:5000 |

### Commands
```bash
# Start tunnel
./start-cloudflare-tunnel.sh

# View logs
tail -f ~/cloudflared.log

# Stop tunnel
pkill -f cloudflared
```

## 📄 License

Proprietary - Frohline Order Management System

## 👥 Support

For issues or questions, contact the development team.

---

**Last Updated:** March 9, 2026
**Version:** 1.0.0
