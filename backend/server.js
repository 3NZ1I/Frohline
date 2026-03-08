const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_PATH = process.env.DB_PATH || './data/orders.db';

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
const fs = require('fs');
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
    return res.json(orders);
  }
  query += ' ORDER BY o.created_at DESC';
  const orders = db.prepare(query).all();
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
    SELECT oi.*, p.name as product_name, p.sku as product_sku
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
