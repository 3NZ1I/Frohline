// Migration script to add Frohline profile products
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/orders.db';

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

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

const insertProduct = db.prepare(`
  INSERT INTO products (id, name, name_en, name_ar, description, sku, price, stock, weight)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const checkProduct = db.prepare('SELECT id FROM products WHERE name = ?');

let added = 0;
let skipped = 0;

translations.forEach((t, index) => {
  // Check if product already exists
  const existing = checkProduct.get(t.tr);
  if (existing) {
    console.log(`Skipping: ${t.tr} (already exists)`);
    skipped++;
    return;
  }

  const id = `frohline-${index.toString().padStart(3, '0')}`;
  const sku = `FRH-${index.toString().padStart(4, '0')}`;
  const combinedName = `${t.tr} | ${t.en} | ${t.ar}`;
  const price = 10.00; // Default price, you can adjust
  const stock = 1000; // Default stock

  insertProduct.run(
    id,
    combinedName,
    t.en,
    t.ar,
    t.tr,
    sku,
    price,
    stock,
    t.weight
  );
  added++;
  console.log(`Added: ${t.tr}`);
});

console.log(`\nMigration complete!`);
console.log(`Added: ${added} products`);
console.log(`Skipped: ${skipped} products`);

db.close();
