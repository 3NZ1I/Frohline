const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || './data/orders.db';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize Database
const db = new Database(DB_PATH);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    name_ar TEXT,
    description TEXT,
    sku TEXT UNIQUE,
    price REAL,
    stock INTEGER DEFAULT 0,
    weight REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    sub_brand_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    total_amount REAL DEFAULT 0,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

  CREATE TABLE IF NOT EXISTS production_reports (
    id TEXT PRIMARY KEY,
    report_date TEXT NOT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    line_1_type TEXT,
    line_1_speed REAL,
    line_1_expected REAL,
    line_1_actual REAL,
    line_1_notes TEXT,
    line_2_type TEXT,
    line_2_speed REAL,
    line_2_expected REAL,
    line_2_actual REAL,
    line_2_notes TEXT,
    line_3_type TEXT,
    line_3_speed REAL,
    line_3_expected REAL,
    line_3_actual REAL,
    line_3_notes TEXT,
    line_4_type TEXT,
    line_4_speed REAL,
    line_4_expected REAL,
    line_4_actual REAL,
    line_4_notes TEXT,
    line_5_type TEXT,
    line_5_speed REAL,
    line_5_expected REAL,
    line_5_actual REAL,
    line_5_notes TEXT,
    line_6_type TEXT,
    line_6_speed REAL,
    line_6_expected REAL,
    line_6_actual REAL,
    line_6_notes TEXT,
    line_7_type TEXT,
    line_7_speed REAL,
    line_7_expected REAL,
    line_7_actual REAL,
    line_7_notes TEXT,
    line_8_type TEXT,
    line_8_speed REAL,
    line_8_expected REAL,
    line_8_actual REAL,
    line_8_notes TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_production_date ON production_reports(report_date);
`);

// Seed initial data
const seedData = () => {
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  if (customerCount === 0) {
    // Sample customers
    const customers = [
      { id: uuidv4(), name: 'John Doe', email: 'john@example.com', phone: '555-0101', company: 'ABC Corp', address: '123 Main St' },
      { id: uuidv4(), name: 'Jane Smith', email: 'jane@example.com', phone: '555-0102', company: 'XYZ Inc', address: '456 Oak Ave' },
      { id: uuidv4(), name: 'Bob Wilson', email: 'bob@example.com', phone: '555-0103', company: 'Tech Solutions', address: '789 Pine Rd' },
    ];
    const insertCustomer = db.prepare('INSERT INTO customers (id, name, email, phone, company, address) VALUES (?, ?, ?, ?, ?, ?)');
    customers.forEach(c => insertCustomer.run(c.id, c.name, c.email, c.phone, c.company, c.address));

    // Sample products
    const products = [
      { id: uuidv4(), name: 'Widget A', description: 'Standard widget', sku: 'WGT-001', price: 25.00, stock: 100 },
      { id: uuidv4(), name: 'Widget B', description: 'Premium widget', sku: 'WGT-002', price: 45.00, stock: 50 },
      { id: uuidv4(), name: 'Gadget X', description: 'Electronic gadget', sku: 'GDG-001', price: 99.99, stock: 30 },
      { id: uuidv4(), name: 'Gadget Y', description: 'Advanced gadget', sku: 'GDG-002', price: 149.99, stock: 20 },
      { id: uuidv4(), name: 'Component Z', description: 'Replacement part', sku: 'CMP-001', price: 15.00, stock: 200 },
    ];
    const insertProduct = db.prepare('INSERT INTO products (id, name, description, sku, price, stock) VALUES (?, ?, ?, ?, ?, ?)');
    products.forEach(p => insertProduct.run(p.id, p.name, p.description, p.sku, p.price, p.stock));

    // Sample orders
    const orders = [
      { id: uuidv4(), customer_id: customers[0].id, status: 'pending', total_amount: 70.00, notes: 'Rush order' },
      { id: uuidv4(), customer_id: customers[1].id, status: 'in_progress', total_amount: 249.98, notes: '' },
      { id: uuidv4(), customer_id: customers[2].id, status: 'completed', total_amount: 149.99, notes: 'Delivered' },
    ];
    const insertOrder = db.prepare('INSERT INTO orders (id, customer_id, status, total_amount, notes) VALUES (?, ?, ?, ?, ?)');
    orders.forEach(o => insertOrder.run(o.id, o.customer_id, o.status, o.total_amount, o.notes));

    // Sample order items
    const orderItems = [
      { id: uuidv4(), order_id: orders[0].id, product_id: products[0].id, quantity: 2, unit_price: 25.00, subtotal: 50.00 },
      { id: uuidv4(), order_id: orders[0].id, product_id: products[4].id, quantity: 1, unit_price: 15.00, subtotal: 15.00 },
      { id: uuidv4(), order_id: orders[0].id, product_id: products[4].id, quantity: 1, unit_price: 5.00, subtotal: 5.00 },
      { id: uuidv4(), order_id: orders[1].id, product_id: products[2].id, quantity: 1, unit_price: 99.99, subtotal: 99.99 },
      { id: uuidv4(), order_id: orders[1].id, product_id: products[3].id, quantity: 1, unit_price: 149.99, subtotal: 149.99 },
      { id: uuidv4(), order_id: orders[2].id, product_id: products[3].id, quantity: 1, unit_price: 149.99, subtotal: 149.99 },
    ];
    const insertOrderItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
    orderItems.forEach(oi => insertOrderItem.run(oi.id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price, oi.subtotal));

    console.log('Database seeded with sample data');
  }
};

seedData();

// Add sub_brand_id column to orders table if it doesn't exist
const addSubBrandColumn = () => {
  try {
    const tableInfo = db.prepare("PRAGMA table_info(orders)").all();
    const hasSubBrand = tableInfo.some(col => col.name === 'sub_brand_id');
    
    if (!hasSubBrand) {
      db.exec('ALTER TABLE orders ADD COLUMN sub_brand_id TEXT');
      console.log('Added sub_brand_id column to orders table');
    } else {
      console.log('sub_brand_id column already exists');
    }
  } catch (error) {
    console.error('Error adding sub_brand_id column:', error.message);
  }
};

addSubBrandColumn();

// Run product translations migration
const runTranslationsMigration = () => {
  try {
    // Check if columns exist
    const tableInfo = db.prepare("PRAGMA table_info(products)").all();
    const hasNameEn = tableInfo.some(col => col.name === 'name_en');
    const hasNameAr = tableInfo.some(col => col.name === 'name_ar');
    const hasWeight = tableInfo.some(col => col.name === 'weight');

    if (!hasNameEn) {
      db.exec('ALTER TABLE products ADD COLUMN name_en TEXT');
      console.log('Added name_en column');
    }
    if (!hasNameAr) {
      db.exec('ALTER TABLE products ADD COLUMN name_ar TEXT');
      console.log('Added name_ar column');
    }
    if (!hasWeight) {
      db.exec('ALTER TABLE products ADD COLUMN weight REAL');
      console.log('Added weight column');
    }

    // Product translations with weights
    const translations = [
      { tr: '60LIK 3ODACIKLI L KASA PROFİLİ', en: '60MM 3-CHAMBER L FRAME PROFILE', ar: 'بروفيل إطار إل 60 مم 3 غرف', weight: 4.2 },
      { tr: '60LIK 3ODACIKLI ORTA KAYIT PROFİLİ', en: '60MM 3-CHAMBER MULLION PROFILE', ar: 'بروفيل فاصل 60 مم 3 غرف', weight: 4.8 },
      { tr: '60LIK 3ODACIKLI PENCERE KANAT PROFİLİ', en: '60MM 3-CHAMBER WINDOW SASH PROFILE', ar: 'بروفيل جناح النافذة 60 مم 3 غرف', weight: 4.8 },
      { tr: '60LIK 3ODACIKLI KAPI KANAT PROFİLİ', en: '60MM 3-CHAMBER DOOR SASH PROFILE', ar: 'بروفيل جناح الباب 60 مم 3 غرف', weight: 6.12 },
      { tr: '60LIK 3ODACIKLI PERVAZLI KASA PROFİLİ', en: '60MM 3-CHAMBER FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء 60 مم 3 غرف', weight: 5.59 },
      { tr: '60LIK 4ODACIKLI PERVAZLI KASA PROFİLİ', en: '60MM 4-CHAMBER FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء 60 مم 4 غرف', weight: 6.175 },
      { tr: 'TEK CAM ÇITASI', en: 'SINGLE GLAZING BEAD', ar: 'شريط الزجاج الفردي', weight: 1.74 },
      { tr: 'ÇİFT CAM ÇITASI', en: 'DOUBLE GLAZING BEAD', ar: 'شريط الزجاج المزدوج', weight: 1.35 },
      { tr: '2,4 MM SÜRME ÇİFTLİ KASA PROFİLİ', en: '2.4MM SLIDING DOUBLE FRAME PROFILE', ar: 'بروفيل إطار منزلق مزدوج 2.4 مم', weight: 10.5 },
      { tr: '2 MM SÜRME ÇİFTLİ KASA PROFİLİ', en: '2MM SLIDING DOUBLE FRAME PROFILE', ar: 'بروفيل إطار منزلق مزدوج 2 مم', weight: 9.36 },
      { tr: '2 MM SÜRME PERVAZLI KASA PROFİLİ', en: '2MM SLIDING FRAME WITH COVER PROFILE', ar: 'بروفيل إطار منزلق مع غطاء 2 مم', weight: 7.8 },
      { tr: '2,4 MM SÜRME PERVAZLI KASA PROFİLİ PROFİLİ', en: '2.4MM SLIDING FRAME WITH COVER PROFILE', ar: 'بروفيل إطار منزلق مع غطاء 2.4 مم', weight: 11.05 },
      { tr: '1,5 MM SÜRME U KASA PROFİLİ PROFİLİ', en: '1.5MM SLIDING U FRAME PROFILE', ar: 'بروفيل إطار منزلق شكل U 1.5 مم', weight: 7.2 },
      { tr: '2 MM SÜRME SİNEKLİKLİ PERVAZLI KASA PROFİLİ', en: '2MM SLIDING FRAME WITH MOSQUITO NET & COVER', ar: 'بروفيل إطار منزلق مع ناموسية وغطاء 2 مم', weight: 9 },
      { tr: '2,4 MM SÜRME PENCERE KANAT PROFİLİ', en: '2.4MM SLIDING WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة منزلق 2.4 مم', weight: 7.2 },
      { tr: '2 MM SÜRME PENCERE KANAT PROFİLİ', en: '2MM SLIDING WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة منزلق 2 مم', weight: 6.3 },
      { tr: '2 MM SÜRME ORTA KAYIT PROFİLİ', en: '2MM SLIDING MULLION PROFILE', ar: 'بروفيل فاصل منزلق 2 مم', weight: 5.58 },
      { tr: '2 MM SÜRME TEKLİ KASA KAPAMA PROFİLİ', en: '2MM SLIDING SINGLE FRAME CLOSING PROFILE', ar: 'بروفيل إغلاق إطار منزلق فردي 2 مم', weight: 1.92 },
      { tr: '2 MM SÜRME SİNEKLİKLİ PENCERE KANAT PROFİLİ', en: '2MM SLIDING WINDOW SASH WITH MOSQUITO NET', ar: 'بروفيل جناح نافذة منزلق مع ناموسية 2 مم', weight: 3.6 },
      { tr: '2 MM SÜRME KİLİTLEME PROFİLİ', en: '2MM SLIDING LOCKING PROFILE', ar: 'بروفيل قفل منزلق 2 مم', weight: 1.8 },
      { tr: 'SÜRME TEK CAM ÇITASI+70LİK ÇİFT CAM', en: 'SLIDING SINGLE GLAZING BEAD + 70MM DOUBLE GLAZING', ar: 'شريط زجاج فردي منزلق + زجاج مزدوج 70 مم', weight: 1.65 },
      { tr: 'SÜRME ÇİFT CAM ÇITASI', en: 'SLIDING DOUBLE GLAZING BEAD', ar: 'شريط زجاج مزدوج منزلق', weight: 1.14 },
      { tr: '2 MM DÜZ 4 ODA KASA PROFİLİ', en: '2MM FLAT 4-CHAMBER FRAME PROFILE', ar: 'بروفيل إطار مسطح 4 غرف 2 مم', weight: 5.7 },
      { tr: '2 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ', en: '2MM FLAT 4-CHAMBER MULLION PROFILE', ar: 'بروفيل فاصل مسطح 4 غرف 2 مم', weight: 6.3 },
      { tr: '2 MM DÜZ 4 ODA KAPI KANAT PROFİLİ', en: '2MM FLAT 4-CHAMBER DOOR SASH PROFILE', ar: 'بروفيل جناح باب مسطح 4 غرف 2 مم', weight: 7.8 },
      { tr: '2 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ', en: '2MM FLAT 4-CHAMBER WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة مسطح 4 غرف 2 مم', weight: 6.3 },
      { tr: '2 MM DÜZ 4 ODA PERVAZLI KASA PROFİLİ', en: '2MM FLAT 4-CHAMBER FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء مسطح 4 غرف 2 مم', weight: 6.825 },
      { tr: '1,7 MM DÜZ 4 ODA KASA PROFİLİ', en: '1.7MM FLAT 4-CHAMBER FRAME PROFILE', ar: 'بروفيل إطار مسطح 4 غرف 1.7 مم', weight: 5.1 },
      { tr: '1,7 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ', en: '1.7MM FLAT 4-CHAMBER MULLION PROFILE', ar: 'بروفيل فاصل مسطح 4 غرف 1.7 مم', weight: 5.4 },
      { tr: '1,7 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ', en: '1.7MM FLAT 4-CHAMBER WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة مسطح 4 غرف 1.7 مم', weight: 5.7 },
      { tr: '1,7 MM DÜZ 4 ODA KAPI KANAT PROFİLİ', en: '1.7MM FLAT 4-CHAMBER DOOR SASH PROFILE', ar: 'بروفيل جناح باب مسطح 4 غرف 1.7 مم', weight: 6.9 },
      { tr: '4 ODA DÜZ 1,7MM PERVAZLI KASA PROFİLİ', en: '4-CHAMBER FLAT 1.7MM FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء مسطح 4 غرف 1.7 مم', weight: 6.175 },
      { tr: '24 MM OVAL ÇITA BEYAZ', en: '24MM OVAL BEAD WHITE', ar: 'شريط بيضاوي أبيض 24 مم', weight: 1.35 },
      { tr: 'DÜZ TEK CAM', en: 'FLAT SINGLE GLAZING', ar: 'زجاج فردي مسطح', weight: 1.65 },
      { tr: 'DÜZ ÇİFT CAM', en: 'FLAT DOUBLE GLAZING', ar: 'زجاج مزدوج مسطح', weight: 1.2 },
      { tr: '60LIK 4ODACIKLI PLATİNİUM L KASA PROFİLİ', en: '60MM 4-CHAMBER PLATINUM L FRAME PROFILE', ar: 'بروفيل إطار بلاتينيوم إل 60 مم 4 غرف', weight: 5.58 },
      { tr: '60LIK 4ODACIKLI PLATİNİUM ORTA KAYIT PROFİLİ', en: '60MM 4-CHAMBER PLATINUM MULLION PROFILE', ar: 'بروفيل فاصل بلاتينيوم 60 مم 4 غرف', weight: 6.3 },
      { tr: '60LIK 4ODACIKLI PLATİNİUM PENCERE KANAT PROFİLİ', en: '60MM 4-CHAMBER PLATINUM WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة بلاتينيوم 60 مم 4 غرف', weight: 6.42 },
      { tr: '60LIK 4ODACIKLI PLATİNİUM KAPI KANAT PROFİLİ', en: '60MM 4-CHAMBER PLATINUM DOOR SASH PROFILE', ar: 'بروفيل جناح باب بلاتينيوم 60 مم 4 غرف', weight: 7.8 },
      { tr: '60LIK 4ODACIKLI PLATİNİUM PERVAZLI KASA PROFİLİ', en: '60MM 4-CHAMBER PLATINUM FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء بلاتينيوم 60 مم 4 غرف', weight: 7.475 },
      { tr: '70LİK 4ODACIKLI L KASA PROFİLİ', en: '70MM 4-CHAMBER L FRAME PROFILE', ar: 'بروفيل إطار إل 70 مم 4 غرف', weight: 4.8 },
      { tr: '70LİK 4ODACIKLI ORTA KAYIT PROFİLİ', en: '70MM 4-CHAMBER MULLION PROFILE', ar: 'بروفيل فاصل 70 مم 4 غرف', weight: 5.4 },
      { tr: '70LİK 4ODACIKLI PERVAZLI KASA PROFİLİ', en: '70MM 4-CHAMBER FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء 70 مم 4 غرف', weight: 5.85 },
      { tr: '70LİK 5ODACIKLI L KASA PROFİLİ', en: '70MM 5-CHAMBER L FRAME PROFILE', ar: 'بروفيل إطار إل 70 مم 5 غرف', weight: 5.7 },
      { tr: '70LİK 5ODACIKLI ORTA KAYIT PROFİLİ', en: '70MM 5-CHAMBER MULLION PROFILE', ar: 'بروفيل فاصل 70 مم 5 غرف', weight: 6.6 },
      { tr: '70LİK 5ODACIKLI PERVAZLI KASA PROFİLİ', en: '70MM 5-CHAMBER FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء 70 مم 5 غرف', weight: 6.6 },
      { tr: 'HAREKETLİ ORTA KAYIT', en: 'MOVABLE MULLION', ar: 'فاصل متحرك', weight: 4.95 },
      { tr: 'U KASA PROFİLİ 40LIK', en: 'U FRAME PROFILE 40MM', ar: 'بروفيل إطار شكل U 40 مم', weight: 6.175 },
      { tr: 'KUTU PROFİLİ', en: 'BOX PROFILE', ar: 'بروفيل صندوق', weight: 5.4 },
      { tr: '10\'LUK LAMBRİ', en: '10MM LAMBRİ', ar: 'لامبري 10 مم', weight: 0 },
      { tr: 'KÖŞE DÖNÜŞ (BORU) PROFİLİ', en: 'CORNER TURN (PIPE) PROFILE', ar: 'بروفيل زاوية دوران (أنبوب)', weight: 3.3 },
      { tr: 'KÖŞE DÖNÜŞ ADAPTÖRÜ BEYAZ', en: 'CORNER TURN ADAPTER WHITE', ar: 'محول زاوية الدوران أبيض', weight: 0 },
      { tr: '60*90 PERVAZ PROFİLİ', en: '60x90 COVER PROFILE', ar: 'بروفيل غطاء 60x90', weight: 2.4 },
      { tr: '70LİK TEK CAM ÇITASI', en: '70MM SINGLE GLAZING BEAD', ar: 'شريط زجاج فردي 70 مم', weight: 2.25 },
      { tr: '2,9 MM 70LİK KASA PROFİLİ', en: '2.9MM 70MM FRAME PROFILE', ar: 'بروفيل إطار 70 مم 2.9 مم', weight: 7.8 },
      { tr: '2,9 MM 70LİK ORTA KAYIT PROFİLİ', en: '2.9MM 70MM MULLION PROFILE', ar: 'بروفيل فاصل 70 مم 2.9 مم', weight: 8.7 },
      { tr: '2,9 MM 70LİK PENCERE KANAT PROFİLİ', en: '2.9MM 70MM WINDOW SASH PROFILE', ar: 'بروفيل جناح نافذة 70 مم 2.9 مم', weight: 9 },
      { tr: '2,9 MM 70LİK KAPI KANAT PROFİLİ', en: '2.9MM 70MM DOOR SASH PROFILE', ar: 'بروفيل جناح باب 70 مم 2.9 مم', weight: 11.4 },
      { tr: '2,9 MM 70LİK PERVAZLI KASA PROFİLİ', en: '2.9MM 70MM FRAME WITH COVER PROFILE', ar: 'بروفيل إطار مع غطاء 70 مم 2.9 مم', weight: 9 }
    ];

    const update = db.prepare('UPDATE products SET name_en = ?, name_ar = ?, weight = ? WHERE name = ? OR name LIKE ?');
    let updated = 0;
    translations.forEach(t => {
      // Check if product has combined name format (TR | EN | AR) or just Turkish name
      const combinedName = `${t.tr} | ${t.en} | ${t.ar}`;
      const result = db.prepare('UPDATE products SET name = ?, name_en = ?, name_ar = ?, weight = ? WHERE name_en = ?').run(combinedName, t.en, t.ar, t.weight, t.en);
      if (result.changes > 0) updated++;
    });

    if (updated > 0) {
      console.log(`Applied translations and weights to ${updated} products`);
    }
  } catch (error) {
    console.error('Translation migration error:', error.message);
  }
};

runTranslationsMigration();

// ==================== API ROUTES ====================

// --- Customers ---
app.get('/api/customers', (req, res) => {
  const customers = db.prepare('SELECT * FROM customers ORDER BY name').all();
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.post('/api/customers', (req, res) => {
  const { name, email, phone, company, address } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO customers (id, name, email, phone, company, address) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, name, email, phone, company, address);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  res.status(201).json(customer);
});

app.put('/api/customers/:id', (req, res) => {
  const { name, email, phone, company, address } = req.body;
  db.prepare('UPDATE customers SET name = ?, email = ?, phone = ?, company = ?, address = ? WHERE id = ?')
    .run(name, email, phone, company, address, req.params.id);
  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
  res.json(customer);
});

app.delete('/api/customers/:id', (req, res) => {
  db.prepare('DELETE FROM customers WHERE id = ?').run(req.params.id);
  res.json({ message: 'Customer deleted' });
});

// --- Products ---
app.get('/api/products', (req, res) => {
  const products = db.prepare('SELECT * FROM products ORDER BY name').all();
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.post('/api/products', (req, res) => {
  const { name, description, sku, price, stock, weight } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO products (id, name, description, sku, price, stock, weight) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, name, description, sku, price, stock, weight);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const { name, description, sku, price, stock, weight } = req.body;
  db.prepare('UPDATE products SET name = ?, description = ?, sku = ?, price = ?, stock = ?, weight = ? WHERE id = ?')
    .run(name, description, sku, price, stock, weight, req.params.id);
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  res.json(product);
});

app.delete('/api/products/:id', (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// Bulk product operations
app.post('/api/products/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No product IDs provided' });
  }
  
  const deleteProduct = db.prepare('DELETE FROM products WHERE id = ?');
  let deleted = 0;
  
  db.transaction(() => {
    ids.forEach(id => {
      deleteProduct.run(id);
      deleted++;
    });
  });
  
  res.json({ message: `${deleted} products deleted`, deleted });
});

app.get('/api/products/export', (req, res) => {
  try {
    let XLSX;
    try {
      XLSX = require('xlsx');
    } catch (e) {
      return res.status(500).json({ error: 'XLSX library not available. Please install xlsx package.' });
    }
    
    const products = db.prepare('SELECT * FROM products ORDER BY name').all();

    const data = products.map(p => ({
      'Name (TR | EN | AR)': p.name,
      'Description': p.description || '',
      'SKU': p.sku || '',
      'Weight (kg)': p.weight || 0,
      'Price': p.price || 0,
      'Stock': p.stock || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="products.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

app.post('/api/products/import', (req, res) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'No products data provided' });
    }
    
    const insertProduct = db.prepare(`
      INSERT INTO products (id, name, description, sku, price, stock, weight, name_en, name_ar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    let imported = 0;
    let errors = [];
    
    db.transaction(() => {
      products.forEach((p, index) => {
        try {
          const id = p['SKU'] ? `import-${p['SKU']}` : `import-${uuidv4()}`;
          const name = p['Name (TR | EN | AR)'] || p['Name'] || '';
          const description = p['Description'] || '';
          const sku = p['SKU'] || '';
          const price = parseFloat(p['Price']) || 0;
          const stock = parseInt(p['Stock']) || 0;
          const weight = parseFloat(p['Weight (kg)']) || 0;
          
          // Try to extract English and Arabic names from combined name
          let nameEn = '', nameAr = '';
          if (name.includes('|')) {
            const parts = name.split('|').map(s => s.trim());
            if (parts.length >= 2) nameEn = parts[1];
            if (parts.length >= 3) nameAr = parts[2];
          }
          
          insertProduct.run(id, name, description, sku, price, stock, weight, nameEn, nameAr);
          imported++;
        } catch (err) {
          errors.push(`Row ${index + 1}: ${err.message}`);
        }
      });
    });
    
    res.json({ 
      message: `Imported ${imported} products`, 
      imported,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: 'Import failed: ' + error.message });
  }
});

// --- Orders ---
app.get('/api/orders', (req, res) => {
  const { status } = req.query;
  let query = `
    SELECT o.id, o.customer_id, o.sub_brand_id, o.status, o.total_amount, o.notes, o.created_at, o.updated_at,
           c.name as customer_name, c.company as customer_company
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
  `;
  if (status) {
    query += ' WHERE o.status = ?';
    query += ' ORDER BY o.created_at DESC';
    const orders = db.prepare(query).all(status);
    console.log('Orders with status filter:', orders);
    return res.json(orders);
  }
  query += ' ORDER BY o.created_at DESC';
  const orders = db.prepare(query).all();
  console.log('All orders:', orders);
  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.prepare(`
    SELECT o.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.company as customer_company, c.address as customer_address
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = ?
  `).get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const items = db.prepare(`
    SELECT oi.*, p.name as product_name, p.sku as product_sku, p.weight as product_weight
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `).all(req.params.id);

  res.json({ ...order, items });
});

app.post('/api/orders', (req, res) => {
  const { customer_id, sub_brand_id, status, notes, items } = req.body;
  const id = uuidv4();
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

  const insertOrder = db.prepare('INSERT INTO orders (id, customer_id, sub_brand_id, status, total_amount, notes) VALUES (?, ?, ?, ?, ?, ?)');
  insertOrder.run(id, customer_id, sub_brand_id || null, status || 'pending', total_amount, notes || '');

  const insertItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
  items.forEach(item => {
    insertItem.run(uuidv4(), id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price);
  });

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  res.status(201).json(order);
});

app.put('/api/orders/:id', (req, res) => {
  const { customer_id, sub_brand_id, status, notes, items } = req.body;
  const total_amount = items ? items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) : 0;

  db.prepare('UPDATE orders SET customer_id = ?, sub_brand_id = ?, status = ?, notes = ?, total_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(customer_id, sub_brand_id || null, status, notes, total_amount, req.params.id);

  if (items) {
    db.prepare('DELETE FROM order_items WHERE order_id = ?').run(req.params.id);
    const insertItem = db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)');
    items.forEach(item => {
      insertItem.run(uuidv4(), req.params.id, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price);
    });
  }

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, req.params.id);
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  res.json(order);
});

app.delete('/api/orders/:id', (req, res) => {
  db.prepare('DELETE FROM orders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Order deleted' });
});

// ==================== Analytics API ====================

app.get('/api/analytics/overview', (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_amount), 0) as sum FROM orders').get().sum;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const totalCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
    
    const ordersByStatus = db.prepare(`
      SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
      FROM orders
      GROUP BY status
    `).all();
    
    const recentOrders = db.prepare(`
      SELECT o.id, c.name as customer_name, o.total_amount, o.status, o.created_at
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `).all();
    
    res.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      ordersByStatus,
      recentOrders,
    });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

app.get('/api/analytics/products', (req, res) => {
  try {
    // Top products by quantity sold
    const topProductsByQty = db.prepare(`
      SELECT p.name, p.sku, SUM(oi.quantity) as total_qty, COUNT(DISTINCT oi.order_id) as order_count
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id
      ORDER BY total_qty DESC
      LIMIT 10
    `).all();
    
    // Top products by revenue
    const topProductsByRevenue = db.prepare(`
      SELECT p.name, p.sku, SUM(oi.subtotal) as total_revenue, SUM(oi.quantity) as qty_sold
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY oi.product_id
      ORDER BY total_revenue DESC
      LIMIT 10
    `).all();
    
    // Low stock products
    const lowStock = db.prepare(`
      SELECT name, sku, stock, price
      FROM products
      WHERE stock < 100
      ORDER BY stock ASC
      LIMIT 10
    `).all();
    
    res.json({
      topProductsByQty,
      topProductsByRevenue,
      lowStock,
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch product analytics' });
  }
});

app.get('/api/analytics/brands', (req, res) => {
  try {
    const salesByBrand = db.prepare(`
      SELECT sub_brand_id, COUNT(*) as order_count, SUM(total_amount) as total_revenue
      FROM orders
      WHERE sub_brand_id IS NOT NULL
      GROUP BY sub_brand_id
      ORDER BY total_revenue DESC
    `).all();
    
    res.json({
      salesByBrand,
    });
  } catch (error) {
    console.error('Brand analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch brand analytics' });
  }
});

app.get('/api/analytics/customers', (req, res) => {
  try {
    const topCustomers = db.prepare(`
      SELECT c.name, c.company, COUNT(o.id) as order_count, SUM(o.total_amount) as total_spent
      FROM customers c
      LEFT JOIN orders o ON c.id = o.customer_id
      GROUP BY c.id
      HAVING order_count > 0
      ORDER BY total_spent DESC
      LIMIT 10
    `).all();
    
    res.json({
      topCustomers,
    });
  } catch (error) {
    console.error('Customer analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch customer analytics' });
  }
});

app.get('/api/analytics/trends', (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    let dateFormat;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateFormat = '%Y-%W';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    const orderTrends = db.prepare(`
      SELECT strftime('${dateFormat}', created_at) as period,
             COUNT(*) as order_count,
             SUM(total_amount) as revenue
      FROM orders
      GROUP BY period
      ORDER BY period DESC
      LIMIT 30
    `).all();
    
    res.json({
      period,
      orderTrends: orderTrends.reverse(), // Reverse to show oldest first for charts
    });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

// ==================== Production Reports API ====================

app.get('/api/production-reports', (req, res) => {
  try {
    const { date, limit } = req.query;
    let query = 'SELECT * FROM production_reports';
    const params = [];
    
    if (date) {
      query += ' WHERE report_date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY report_date DESC, created_at DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const reports = db.prepare(query).all(...params);
    res.json(reports);
  } catch (error) {
    console.error('Error fetching production reports:', error);
    res.status(500).json({ error: 'Failed to fetch production reports' });
  }
});

app.get('/api/production-reports/:id', (req, res) => {
  try {
    const report = db.prepare('SELECT * FROM production_reports WHERE id = ?').get(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching production report:', error);
    res.status(500).json({ error: 'Failed to fetch production report' });
  }
});

app.post('/api/production-reports', (req, res) => {
  try {
    const {
      report_date,
      created_by,
      lines,
    } = req.body;

    const id = uuidv4();

    const insertReport = db.prepare(`
      INSERT INTO production_reports (
        id, report_date, created_by,
        line_1_type, line_1_speed, line_1_expected, line_1_actual, line_1_notes,
        line_2_type, line_2_speed, line_2_expected, line_2_actual, line_2_notes,
        line_3_type, line_3_speed, line_3_expected, line_3_actual, line_3_notes,
        line_4_type, line_4_speed, line_4_expected, line_4_actual, line_4_notes,
        line_5_type, line_5_speed, line_5_expected, line_5_actual, line_5_notes,
        line_6_type, line_6_speed, line_6_expected, line_6_actual, line_6_notes,
        line_7_type, line_7_speed, line_7_expected, line_7_actual, line_7_notes,
        line_8_type, line_8_speed, line_8_expected, line_8_actual, line_8_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertReport.run(
      id,
      report_date,
      created_by || 'Unknown',
      lines[0]?.type || '', lines[0]?.speed || 0, lines[0]?.expected || 0, lines[0]?.actual || 0, lines[0]?.notes || '',
      lines[1]?.type || '', lines[1]?.speed || 0, lines[1]?.expected || 0, lines[1]?.actual || 0, lines[1]?.notes || '',
      lines[2]?.type || '', lines[2]?.speed || 0, lines[2]?.expected || 0, lines[2]?.actual || 0, lines[2]?.notes || '',
      lines[3]?.type || '', lines[3]?.speed || 0, lines[3]?.expected || 0, lines[3]?.actual || 0, lines[3]?.notes || '',
      lines[4]?.type || '', lines[4]?.speed || 0, lines[4]?.expected || 0, lines[4]?.actual || 0, lines[4]?.notes || '',
      lines[5]?.type || '', lines[5]?.speed || 0, lines[5]?.expected || 0, lines[5]?.actual || 0, lines[5]?.notes || '',
      lines[6]?.type || '', lines[6]?.speed || 0, lines[6]?.expected || 0, lines[6]?.actual || 0, lines[6]?.notes || '',
      lines[7]?.type || '', lines[7]?.speed || 0, lines[7]?.expected || 0, lines[7]?.actual || 0, lines[7]?.notes || ''
    );

    const report = db.prepare('SELECT * FROM production_reports WHERE id = ?').get(id);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating production report:', error);
    res.status(500).json({ error: 'Failed to create production report' });
  }
});

app.put('/api/production-reports/:id', (req, res) => {
  try {
    const {
      report_date,
      created_by,
      lines,
    } = req.body;
    
    const updateReport = db.prepare(`
      UPDATE production_reports SET
        report_date = ?,
        created_by = ?,
        line_1_type = ?, line_1_speed = ?, line_1_expected = ?, line_1_actual = ?, line_1_notes = ?,
        line_2_type = ?, line_2_speed = ?, line_2_expected = ?, line_2_actual = ?, line_2_notes = ?,
        line_3_type = ?, line_3_speed = ?, line_3_expected = ?, line_3_actual = ?, line_3_notes = ?,
        line_4_type = ?, line_4_speed = ?, line_4_expected = ?, line_4_actual = ?, line_4_notes = ?,
        line_5_type = ?, line_5_speed = ?, line_5_expected = ?, line_5_actual = ?, line_5_notes = ?,
        line_6_type = ?, line_6_speed = ?, line_6_expected = ?, line_6_actual = ?, line_6_notes = ?,
        line_7_type = ?, line_7_speed = ?, line_7_expected = ?, line_7_actual = ?, line_7_notes = ?,
        line_8_type = ?, line_8_speed = ?, line_8_expected = ?, line_8_actual = ?, line_8_notes = ?
      WHERE id = ?
    `);
    
    updateReport.run(
      report_date,
      created_by || 'Unknown',
      lines[0]?.type || '', lines[0]?.speed || 0, lines[0]?.expected || 0, lines[0]?.actual || 0, lines[0]?.notes || '',
      lines[1]?.type || '', lines[1]?.speed || 0, lines[1]?.expected || 0, lines[1]?.actual || 0, lines[1]?.notes || '',
      lines[2]?.type || '', lines[2]?.speed || 0, lines[2]?.expected || 0, lines[2]?.actual || 0, lines[2]?.notes || '',
      lines[3]?.type || '', lines[3]?.speed || 0, lines[3]?.expected || 0, lines[3]?.actual || 0, lines[3]?.notes || '',
      lines[4]?.type || '', lines[4]?.speed || 0, lines[4]?.expected || 0, lines[4]?.actual || 0, lines[4]?.notes || '',
      lines[5]?.type || '', lines[5]?.speed || 0, lines[5]?.expected || 0, lines[5]?.actual || 0, lines[5]?.notes || '',
      lines[6]?.type || '', lines[6]?.speed || 0, lines[6]?.expected || 0, lines[6]?.actual || 0, lines[6]?.notes || '',
      lines[7]?.type || '', lines[7]?.speed || 0, lines[7]?.expected || 0, lines[7]?.actual || 0, lines[7]?.notes || '',
      req.params.id
    );
    
    const report = db.prepare('SELECT * FROM production_reports WHERE id = ?').get(req.params.id);
    res.json(report);
  } catch (error) {
    console.error('Error updating production report:', error);
    res.status(500).json({ error: 'Failed to update production report' });
  }
});

app.delete('/api/production-reports/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM production_reports WHERE id = ?').run(req.params.id);
    res.json({ message: 'Production report deleted' });
  } catch (error) {
    console.error('Error deleting production report:', error);
    res.status(500).json({ error: 'Failed to delete production report' });
  }
});

// Production Analytics
app.get('/api/analytics/production', (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    
    let dateFormat;
    switch (period) {
      case 'daily':
        dateFormat = '%Y-%m-%d';
        break;
      case 'weekly':
        dateFormat = '%Y-%W';
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }
    
    // Production trends by date
    const productionTrends = db.prepare(`
      SELECT strftime('${dateFormat}', report_date) as period,
             AVG(line_1_actual + line_2_actual + line_3_actual + line_4_actual + 
                 line_5_actual + line_6_actual + line_7_actual + line_8_actual) as total_actual,
             AVG(line_1_expected + line_2_expected + line_3_expected + line_4_expected + 
                 line_5_expected + line_6_expected + line_7_expected + line_8_expected) as total_expected
      FROM production_reports
      GROUP BY period
      ORDER BY period DESC
      LIMIT 30
    `).all();
    
    // Line efficiency
    const lineEfficiency = db.prepare(`
      SELECT 
        (SUM(line_1_actual) * 1.0 / NULLIF(SUM(line_1_expected), 0) * 100) as line_1_efficiency,
        (SUM(line_2_actual) * 1.0 / NULLIF(SUM(line_2_expected), 0) * 100) as line_2_efficiency,
        (SUM(line_3_actual) * 1.0 / NULLIF(SUM(line_3_expected), 0) * 100) as line_3_efficiency,
        (SUM(line_4_actual) * 1.0 / NULLIF(SUM(line_4_expected), 0) * 100) as line_4_efficiency,
        (SUM(line_5_actual) * 1.0 / NULLIF(SUM(line_5_expected), 0) * 100) as line_5_efficiency,
        (SUM(line_6_actual) * 1.0 / NULLIF(SUM(line_6_expected), 0) * 100) as line_6_efficiency,
        (SUM(line_7_actual) * 1.0 / NULLIF(SUM(line_7_expected), 0) * 100) as line_7_efficiency,
        (SUM(line_8_actual) * 1.0 / NULLIF(SUM(line_8_expected), 0) * 100) as line_8_efficiency
      FROM production_reports
    `).get();
    
    // Top production types
    const topProductionTypes = db.prepare(`
      SELECT line_1_type as type, SUM(line_1_actual) as total
      FROM production_reports WHERE line_1_type != ''
      GROUP BY line_1_type
      UNION ALL
      SELECT line_2_type as type, SUM(line_2_actual) as total
      FROM production_reports WHERE line_2_type != ''
      GROUP BY line_2_type
      UNION ALL
      SELECT line_3_type as type, SUM(line_3_actual) as total
      FROM production_reports WHERE line_3_type != ''
      GROUP BY line_3_type
      UNION ALL
      SELECT line_4_type as type, SUM(line_4_actual) as total
      FROM production_reports WHERE line_4_type != ''
      GROUP BY line_4_type
      UNION ALL
      SELECT line_5_type as type, SUM(line_5_actual) as total
      FROM production_reports WHERE line_5_type != ''
      GROUP BY line_5_type
      UNION ALL
      SELECT line_6_type as type, SUM(line_6_actual) as total
      FROM production_reports WHERE line_6_type != ''
      GROUP BY line_6_type
      UNION ALL
      SELECT line_7_type as type, SUM(line_7_actual) as total
      FROM production_reports WHERE line_7_type != ''
      GROUP BY line_7_type
      UNION ALL
      SELECT line_8_type as type, SUM(line_8_actual) as total
      FROM production_reports WHERE line_8_type != ''
      GROUP BY line_8_type
      ORDER BY total DESC
      LIMIT 10
    `).all();
    
    // Recent reports
    const recentReports = db.prepare(`
      SELECT id, report_date, created_by, created_at
      FROM production_reports
      ORDER BY report_date DESC, created_at DESC
      LIMIT 10
    `).all();
    
    res.json({
      productionTrends: productionTrends.reverse(),
      lineEfficiency,
      topProductionTypes,
      recentReports,
    });
  } catch (error) {
    console.error('Production analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch production analytics' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
