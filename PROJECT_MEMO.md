# Frohline Order Management System - Project Memo

## Project Overview
**Client:** Frohline (Manufacturing Company)
**Domain:** bessar.work
**Location:** D:\Frohline\order-management-system (Windows) → /home/bashar/order-management-system (Linux Docker)

## Tech Stack
- **Frontend:** React 18, Bootstrap 5, React Router v6
- **Backend:** Node.js, Express.js, Better-SQLite3
- **Database:** SQLite (persisted in Docker volume)
- **Containerization:** Docker, Docker Compose
- **Tunnel:** Cloudflare Tunnel (Docker container)

## Key Features Implemented

### 1. Order Management
- Create/Edit orders with customer and sub-brand selection
- Multi-product orders with weight calculations
- Order status tracking (Pending, In Progress, Completed, Cancelled)
- **Export Options:**
  - XLSX with/without prices
  - PDF with/without prices (with sub-brand logo)
  - Turkish/Arabic/English support

### 2. Product Management
- 59 Frohline profile products pre-loaded
- Bulk operations (multi-select, delete, export)
- XLSX import/export
- Stock tracking with color indicators

### 3. Customer Management
- Full CRUD operations
- Company and contact information

### 4. Production Tracking (NEW)
- 8 production lines monitoring
- Daily production reports
- Production type dropdown with 59 types (auto-fills speed)
- Expected vs Actual calculations
- Efficiency tracking
- Filter by period (All/Weekly/Monthly/Annual)
- Multi-select PDF export

### 5. Analytics Dashboard
- Overview metrics (Orders, Revenue, Products, Customers)
- Orders by status (Pie chart)
- Order trends (Line chart - Daily/Weekly/Monthly)
- Top products by revenue (Bar chart)
- Sales by brand (Bar chart)
- Top customers table
- Low stock alerts
- **Production Analytics:**
  - Production trends chart
  - Line efficiency (8 lines)
  - Top production types
  - Recent production reports

### 6. Multi-Language Support
- **Turkish (TR)** - Full translation with character transliteration in PDFs
- **English (EN)** - Default
- **Arabic (AR)** - Full translation with RTL support and character transliteration in PDFs
- Persistent language selection

### 7. Sub-Brand System
- 16 sub-brands with logos and colors
- Visual selector with logo preview
- Brand logos in order lists
- Sub-brand logo in PDF exports

## Cloudflare Tunnel Configuration

### Domain Setup
- **Frontend:** https://froh.bessar.work → localhost:3000
- **Backend API:** https://api1.bessar.work → localhost:5000

### Tunnel Details
- **Tunnel ID:** 90137fe9-7a2d-4159-a433-d1fdef193f83
- **Running as:** Docker container (cloudflared-tunnel)
- **Token:** Stored in startup script

### Startup Commands
```bash
# Start tunnel
cd /home/bashar/order-management-system
./start-cloudflare-tunnel.sh

# View logs
docker logs cloudflared-tunnel --tail 50 -f

# Stop tunnel
docker stop cloudflared-tunnel
```

## Database Schema

### Tables
1. **customers** - Customer information
2. **products** - Product catalog (59 Frohline products + samples)
3. **orders** - Order headers with sub_brand_id
4. **order_items** - Order line items
5. **production_reports** - Daily production data (8 lines)

### Key Migrations Applied
- Added `sub_brand_id` column to orders table
- Added `name_en`, `name_ar`, `weight` columns to products
- Created `production_reports` table with 43 columns

## Docker Configuration

### Services
```yaml
backend:
  - Port: 127.0.0.1:5000:5000
  - Volume: backend-data:/app/data
  - Code mount: ./backend:/app
  
frontend:
  - Port: 127.0.0.1:3000:3000
  - Code mount: ./frontend:/app
  - API URL: https://api1.bessar.work
```

### Important Notes
- Backend ports bound to 127.0.0.1 for Cloudflare Tunnel
- Database persisted in named volume `backend-data`
- Code mounted as volumes for development
- node_modules excluded from volume mounts

## File Structure
```
order-management-system/
├── docker-compose.yml
├── start-cloudflare-tunnel.sh
├── backend/
│   ├── server.js (970 lines - includes analytics & production APIs)
│   ├── migrate-products.js (59 products migration)
│   └── data/orders.db (SQLite database)
└── frontend/
    └── src/
        ├── components/
        │   ├── OrdersList.js (328 lines - with export dropdown)
        │   ├── OrderForm.js (614 lines - with PDF export)
        │   ├── Customers.js (260 lines - fully translated)
        │   ├── Products.js (717 lines - bulk ops, import/export)
        │   ├── Analytics.js (704 lines - production analytics added)
        │   └── ProductionDetails.js (793 lines - NEW feature)
        ├── utils/
        │   ├── excelExport.js (150 lines - XLSX export)
        │   └── pdfExport.js (363 lines - PDF with transliteration)
        └── App.js (205 lines - sidebar navigation)
```

## Recent Changes (Latest Session)

### PDF Export Improvements
1. **Turkish Characters:** Transliterated (İ→I, ş→s, ğ→g, etc.)
2. **Arabic Characters:** Transliterated to English (العميل→Customer, etc.)
3. **Sub-brand Logo:** Added to top-right corner (15x9mm)
4. **Color Scheme:** Light backgrounds, all text visible
5. **Layout:** Structured tables with borders, alternating rows

### Sidebar Fix
- Active page text stays WHITE (not blue)
- Red background (#dc3545) on active page only

### Production Page Features
- Production type dropdown (59 types with speeds)
- Auto-fill speed when type selected
- Filter by period (All/Weekly/Monthly/Annual)
- Multi-select reports
- PDF export with full details

## Common Issues & Solutions

### Issue: Database Reset
**Cause:** `docker-compose down -v` removes volumes
**Solution:** Run `docker exec oms-backend node /app/migrate-products.js`

### Issue: PDF Turkish/Arabic Characters Garbled
**Cause:** jsPDF doesn't support UTF-8 fonts by default
**Solution:** Transliterate characters to ASCII equivalents

### Issue: Bootstrap Dropdown Not Working
**Cause:** Missing Bootstrap JS
**Solution:** Added to public/index.html

### Issue: Cloudflare Tunnel Not Connecting
**Cause:** Ports not bound to 127.0.0.1
**Solution:** Updated docker-compose.yml to use 127.0.0.1:3000 and 127.0.0.1:5000

## Git Repository
- **Remote:** git@github.com:3NZ1I/Frohline.git
- **Branch:** main
- **Latest Commit:** Production features and PDF improvements

## Commands Reference

### Docker Operations
```bash
# Start all services
docker-compose up -d

# Restart specific service
docker-compose restart frontend
docker-compose restart backend

# View logs
docker-compose logs -f frontend
docker-compose logs -f backend

# Database backup
docker cp oms-backend:/app/data/orders.db ./backup.db

# Database restore
docker cp backup.db oms-backend:/app/data/orders.db
docker-compose restart backend
```

### Git Operations
```bash
# Commit and push
git add -A
git commit -m "feat: description"
git push origin main
```

### Cloudflare Tunnel
```bash
# Start
./start-cloudflare-tunnel.sh

# Check status
docker ps | grep cloudflared

# View logs
docker logs cloudflared-tunnel --tail 50 -f
```

## Next Steps / Future Enhancements
1. User authentication and authorization
2. Role-based access control
3. Email notifications for order status
4. PDF invoice generation with company stamp
5. Barcode scanning for products
6. Mobile app for production tracking
7. Automated daily backups
8. Multi-currency support
9. Advanced analytics (forecasting, trends)
10. API rate limiting

## Contact Information
- **Developer:** AI Assistant
- **Client:** Frohline Management
- **Domain:** bessar.work
- **Last Updated:** March 9, 2026

---

## Quick Start for Next Session

1. **Start Docker:**
   ```bash
   cd /home/bashar/order-management-system
   docker-compose up -d
   ```

2. **Start Cloudflare Tunnel:**
   ```bash
   ./start-cloudflare-tunnel.sh
   ```

3. **Verify Services:**
   - Frontend: https://froh.bessar.work
   - Backend: https://api1.bessar.work
   - Tunnel: `docker ps | grep cloudflared`

4. **Check Database:**
   ```bash
   docker exec oms-backend node -e "const db = require('better-sqlite3')('/app/data/orders.db'); console.log('Products:', db.prepare('SELECT COUNT(*) as count FROM products').get().count);"
   ```

5. **If Products Missing:**
   ```bash
   docker exec oms-backend node /app/migrate-products.js
   ```
