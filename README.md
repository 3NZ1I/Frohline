# Frohline Order Management System

A comprehensive full-stack Order Management System for factory orders, built with React, Node.js, Express, and SQLite, containerized with Docker.

## 🌟 Features

### 📋 Orders Management
- View all orders with status filtering (All, Pending, In Progress, Completed)
- Create new orders with multiple products and sub-brand selection
- Edit existing orders with real-time weight and price calculations
- Update order status with one-click actions
- Delete orders
- **Export orders to XLSX** with customer details, items, and totals
- **Sub-brand selection** with visual logo display for each order

### 👥 Customer Directory
- Add, edit, and delete customers
- Store complete customer details (name, company, email, phone, address)
- Quick customer selection when creating orders

### 📦 Product Directory
- Add, edit, and delete products
- Product details (name in TR/EN/AR, SKU, description, price, stock, weight)
- Stock level indicators (green/yellow/red badges)
- **Bulk Operations:**
  - Multi-select products with checkboxes
  - Delete multiple products at once
  - Export all products or selected products to XLSX
  - Import products from XLSX file
- Weight tracking for accurate shipping calculations

### 📊 Analytics Dashboard (Coming Soon)
- Visual business insights
- Sales trends and statistics
- Top-selling products analysis
- Customer order history
- Inventory insights

### 🌐 Multi-Language Support
- Turkish (TR)
- English (EN)
- Arabic (AR) with RTL layout
- Persistent language selection

### 🎨 Brand Management
- 16 sub-brands with logos and colors
- Visual sub-brand selector with logo preview
- Brand logos displayed in order lists

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- Axios
- XLSX (SheetJS) for Excel export/import

### Backend
- Node.js
- Express.js
- Better-SQLite3
- UUID for unique IDs

### DevOps
- Docker
- Docker Compose
- Volume persistence for database

## 🚀 Getting Started

### Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

### Running with Docker

1. Navigate to the project directory:
   ```bash
   cd /home/bashar/order-management-system
   ```

2. Start the application:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5000/api

4. View logs:
   ```bash
   docker-compose logs -f
   ```

### Stopping the Application

```bash
docker-compose down
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

## 📁 Project Structure

```
order-management-system/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   ├── migrate-products.js       # Product migration script
│   └── data/                     # Created at runtime
│       └── orders.db
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    │   ├── index.html
    │   └── brands/              # Sub-brand logo images
    └── src/
        ├── index.js
        ├── index.css
        ├── api.js               # API client
        ├── context/
        │   └── LanguageContext.js
        ├── utils/
        │   └── excelExport.js   # XLSX export utilities
        ├── data/
        │   └── subBrands.js     # Sub-brand configuration
        └── components/
            ├── OrdersList.js    # Orders list with filters
            ├── OrderForm.js     # Create/Edit order form
            ├── Customers.js     # Customer management
            ├── Products.js      # Product management with bulk ops
            └── SubBrandSelector.js  # Visual sub-brand selector
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

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - Server port (default: 5000)
- `DB_PATH` - Database path (default: ./data/orders.db)
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

### Docker Volumes

- `backend-data` - Persistent database storage
- `./backend:/app` - Code volume for development (backend)
- `./frontend:/app` - Code volume for development (frontend)

## 📝 Usage Guide

### Creating an Order

1. Click "➕ New Order" in the sidebar
2. Select a customer from the dropdown
3. Select a sub-brand (logo will be displayed)
4. Add products:
   - Select product from dropdown
   - Enter quantity
   - Click "+ Add Product"
5. Review order summary (total weight, amount)
6. Add notes if needed
7. Click "Create Order"

### Exporting Orders

1. Go to Orders list
2. Click "📊 XLSX" button on any order
3. Choose with or without prices
4. File downloads automatically

### Bulk Product Operations

1. Go to Products page
2. Select products using checkboxes
3. Use bulk action toolbar:
   - 🗑️ Delete Selected
   - 📊 Export Selected
4. Or use global actions:
   - 📥 Export All Products
   - 📤 Import Products (upload XLSX)

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

### Port conflicts
Edit `docker-compose.yml` to change ports:
```yaml
ports:
  - "8080:3000"  # Frontend
  - "5001:5000"  # Backend
```

## 📄 License

Proprietary - Frohline Order Management System

## 👥 Support

For issues or questions, contact the development team.
