# Product Translations & Weights Feature

## Overview

Products now display **all three languages together** in a single name field, regardless of system language. Each product also has an associated weight.

### Name Format
```
Turkish Name | English Name | Arabic Name
```

Example:
```
60LIK 3ODACIKLI L KASA PROFİLİ | 60MM 3-CHAMBER L FRAME PROFILE | بروفيل إطار إل 60 مم 3 غرف
```

## Database Schema

```sql
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,           -- Combined: TR | EN | AR
  name_en TEXT,                 -- English only (for reference)
  name_ar TEXT,                 -- Arabic only (for reference)
  description TEXT,
  sku TEXT UNIQUE,
  price REAL,
  stock INTEGER DEFAULT 0,
  weight REAL,                  -- Weight in kg
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Product List with Weights

| # | Turkish Name | Weight (kg) |
|---|--------------|-------------|
| 1 | 60LIK 3ODACIKLI L KASA PROFİLİ | 4.2 |
| 2 | 60LIK 3ODACIKLI ORTA KAYIT PROFİLİ | 4.8 |
| 3 | 60LIK 3ODACIKLI PENCERE KANAT PROFİLİ | 4.8 |
| 4 | 60LIK 3ODACIKLI KAPI KANAT PROFİLİ | 6.12 |
| 5 | 60LIK 3ODACIKLI PERVAZLI KASA PROFİLİ | 5.59 |
| 6 | 60LIK 4ODACIKLI PERVAZLI KASA PROFİLİ | 6.175 |
| 7 | TEK CAM ÇITASI | 1.74 |
| 8 | ÇİFT CAM ÇITASI | 1.35 |
| 9 | 2,4 MM SÜRME ÇİFTLİ KASA PROFİLİ | 10.5 |
| 10 | 2 MM SÜRME ÇİFTLİ KASA PROFİLİ | 9.36 |
| 11 | 2 MM SÜRME PERVAZLI KASA PROFİLİ | 7.8 |
| 12 | 2,4 MM SÜRME PERVAZLI KASA PROFİLİ PROFİLİ | 11.05 |
| 13 | 1,5 MM SÜRME U KASA PROFİLİ PROFİLİ | 7.2 |
| 14 | 2 MM SÜRME SİNEKLİKLİ PERVAZLI KASA PROFİLİ | 9 |
| 15 | 2,4 MM SÜRME PENCERE KANAT PROFİLİ | 7.2 |
| 16 | 2 MM SÜRME PENCERE KANAT PROFİLİ | 6.3 |
| 17 | 2 MM SÜRME ORTA KAYIT PROFİLİ | 5.58 |
| 18 | 2 MM SÜRME TEKLİ KASA KAPAMA PROFİLİ | 1.92 |
| 19 | 2 MM SÜRME SİNEKLİKLİ PENCERE KANAT PROFİLİ | 3.6 |
| 20 | 2 MM SÜRME KİLİTLEME PROFİLİ | 1.8 |
| 21 | SÜRME TEK CAM ÇITASI+70LİK ÇİFT CAM | 1.65 |
| 22 | SÜRME ÇİFT CAM ÇITASI | 1.14 |
| 23 | 2 MM DÜZ 4 ODA KASA PROFİLİ | 5.7 |
| 24 | 2 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ | 6.3 |
| 25 | 2 MM DÜZ 4 ODA KAPI KANAT PROFİLİ | 7.8 |
| 26 | 2 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ | 6.3 |
| 27 | 2 MM DÜZ 4 ODA PERVAZLI KASA PROFİLİ | 6.825 |
| 28 | 1,7 MM DÜZ 4 ODA KASA PROFİLİ | 5.1 |
| 29 | 1,7 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ | 5.4 |
| 30 | 1,7 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ | 5.7 |
| 31 | 1,7 MM DÜZ 4 ODA KAPI KANAT PROFİLİ | 6.9 |
| 32 | 4 ODA DÜZ 1,7MM PERVAZLI KASA PROFİLİ | 6.175 |
| 33 | 24 MM OVAL ÇITA BEYAZ | 1.35 |
| 34 | DÜZ TEK CAM | 1.65 |
| 35 | DÜZ ÇİFT CAM | 1.2 |
| 36 | 60LIK 4ODACIKLI PLATİNİUM L KASA PROFİLİ | 5.58 |
| 37 | 60LIK 4ODACIKLI PLATİNİUM ORTA KAYIT PROFİLİ | 6.3 |
| 38 | 60LIK 4ODACIKLI PLATİNİUM PENCERE KANAT PROFİLİ | 6.42 |
| 39 | 60LIK 4ODACIKLI PLATİNİUM KAPI KANAT PROFİLİ | 7.8 |
| 40 | 60LIK 4ODACIKLI PLATİNİUM PERVAZLI KASA PROFİLİ | 7.475 |
| 41 | 70LİK 4ODACIKLI L KASA PROFİLİ | 4.8 |
| 42 | 70LİK 4ODACIKLI ORTA KAYIT PROFİLİ | 5.4 |
| 43 | 70LİK 4ODACIKLI PERVAZLI KASA PROFİLİ | 5.85 |
| 44 | 70LİK 5ODACIKLI L KASA PROFİLİ | 5.7 |
| 45 | 70LİK 5ODACIKLI ORTA KAYIT PROFİLİ | 6.6 |
| 46 | 70LİK 5ODACIKLI PERVAZLI KASA PROFİLİ | 6.6 |
| 47 | HAREKETLİ ORTA KAYIT | 4.95 |
| 48 | U KASA PROFİLİ 40LIK | 6.175 |
| 49 | KUTU PROFİLİ | 5.4 |
| 50 | 10'LUK LAMBRİ | 0 |
| 51 | KÖŞE DÖNÜŞ (BORU) PROFİLİ | 3.3 |
| 52 | KÖŞE DÖNÜŞ ADAPTÖRÜ BEYAZ | 0 |
| 53 | 60*90 PERVAZ PROFİLİ | 2.4 |
| 54 | 70LİK TEK CAM ÇITASI | 2.25 |
| 55 | 2,9 MM 70LİK KASA PROFİLİ | 7.8 |
| 56 | 2,9 MM 70LİK ORTA KAYIT PROFİLİ | 8.7 |
| 57 | 2,9 MM 70LİK PENCERE KANAT PROFİLİ | 9 |
| 58 | 2,9 MM 70LİK KAPI KANAT PROFİLİ | 11.4 |
| 59 | 2,9 MM 70LİK PERVAZLI KASA PROFİLİ | 9 |

## How It Works

### Backend (`server.js`)

1. **Automatic Migration**: On startup, `runTranslationsMigration()`:
   - Adds `name_en`, `name_ar`, and `weight` columns if missing
   - Creates combined names: `TR | EN | AR`
   - Applies weights to all 59 products

2. **API Response**: Returns products with all fields:
   ```json
   {
     "id": "...",
     "name": "60LIK 3ODACIKLI L KASA PROFİLİ | 60MM 3-CHAMBER L FRAME PROFILE | بروفيل إطار إل 60 مم 3 غرف",
     "name_en": "60MM 3-CHAMBER L FRAME PROFILE",
     "name_ar": "بروفيل إطار إل 60 مم 3 غرف",
     "weight": 4.2,
     ...
   }
   ```

### Frontend (`Products.js`)

1. **Table Display**: Shows product name with all three languages
2. **Weight Column**: Displays weight in kg with badge
3. **Form**: Includes weight field when creating/editing products

## Persistence After Git Deployment

The translations and weights are **stored in the SQLite database**. When deploying via Git:

1. The migration code in `server.js` runs automatically on every startup
2. If products already have combined names, they won't be duplicated
3. New deployments will automatically get all translations and weights

### Important: Preserve Database Volume

```bash
# Normal stop (keeps data)
docker-compose down

# DON'T use -v flag (deletes volumes)
# docker-compose down -v  ❌
```

## Adding New Products

When creating new products via the API or UI, include all three languages in the name:

```javascript
POST /api/products
{
  "name": "Yeni Ürün | New Product | منتج جديد",
  "weight": 5.5,
  "sku": "NEW-001",
  "price": 100,
  "stock": 50
}
```

Or add to the migration in `server.js`:

```javascript
const translations = [
  // ... existing translations
  { tr: 'Yeni Ürün', en: 'New Product', ar: 'منتج جديد', weight: 5.5 }
];
```

## Files Modified

1. `backend/server.js` - Schema + migration with weights
2. `frontend/src/components/Products.js` - Display combined names + weight column
3. `TRANSLATIONS.md` - This documentation

## Troubleshooting

### Names not showing all three languages?
1. Restart backend: `docker restart oms-backend`
2. Check migration ran: Look for "Applied translations and weights to X products" in logs

### Weights not showing?
1. Verify column exists: `docker exec oms-backend node -e "const db=require('better-sqlite3')('/app/data/orders.db'); console.log(db.prepare('PRAGMA table_info(products)').all())"`
2. Re-run migration by restarting backend
