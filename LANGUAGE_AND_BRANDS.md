# Turkish Language & Sub-Brand Features

## Overview

The system now includes:
1. **Full Turkish language support** with TR/EN/AR language toggle
2. **Sub-Brand selection** with visual logo cards in the New Order page

## 1. Language Support

### Available Languages
- 🇹🇷 **Turkish (TR)** - Default language for Turkish users
- 🇬🇧 **English (EN)** - International support
- 🇸🇦 **Arabic (AR)** - RTL support included

### Language Selector

Located in the sidebar at the bottom. Users can switch between languages at any time.

**Translations include:**
- Sidebar navigation
- Orders page
- Order form (create/edit)
- Products page
- Customers page
- All buttons, labels, and messages

### How It Works

The `LanguageContext` provides translations throughout the app:

```javascript
import { useLanguage } from './context/LanguageContext';

const { t, language, setLanguage } = useLanguage();

// Use in components
<h2>{t('ordersTitle')}</h2>
<button>{t('newOrderBtn')}</button>
```

### Adding New Translations

Edit `frontend/src/context/LanguageContext.js`:

```javascript
const translations = {
  tr: {
    newKey: 'Türkçe çeviri',
  },
  en: {
    newKey: 'English translation',
  },
  ar: {
    newKey: 'الترجمة العربية',
  },
};
```

## 2. Sub-Brand Selection

### Available Sub-Brands

| Brand | Turkish | Arabic | Color |
|-------|---------|--------|-------|
| Frohline | Frohline | فرولين | Blue (#0066cc) |
| Aluplast | Aluplast | ألوبلاست | Orange (#ff6600) |
| Profine | Profine | بروفاين | Green (#009933) |
| Veka | Veka | فيكا | Pink (#cc0066) |
| Rehau | Rehau | ريهاو | Red (#cc3300) |
| Other | Diğer | آخر | Gray (#666666) |

### Visual Brand Cards

In the **New Order** page, users select a sub-brand by clicking on visual cards:
- **Logo display**: Shows brand logo if available
- **Color placeholder**: Shows brand initial if logo not found
- **Selected state**: Highlighted with blue border
- **Multi-language**: Brand names shown in selected language

### How to Add Your Brand Images

1. Place your logo images in: `frontend/public/brands/`
2. Supported formats: `.svg`, `.png`, `.jpg`
3. Update `frontend/src/data/subBrands.js`:

```javascript
{
  id: 'yourbrand',
  name: {
    tr: 'Your Brand TR',
    en: 'Your Brand EN',
    ar: 'اسم علامتك التجارية',
  },
  logo: '/brands/yourbrand-logo.png',
  color: '#hexcolor',
}
```

### Database Schema

Orders table now includes `sub_brand_id`:

```sql
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL,
  sub_brand_id TEXT,              -- Selected sub-brand
  status TEXT,
  total_amount REAL,
  notes TEXT,
  created_at DATETIME,
  updated_at DATETIME
);
```

## Files Modified

### Backend
- `backend/server.js` - Added `sub_brand_id` to orders table and API

### Frontend
- `frontend/src/index.js` - Wrapped app with LanguageProvider
- `frontend/src/App.js` - Added language selector to sidebar
- `frontend/src/context/LanguageContext.js` - NEW: Language management
- `frontend/src/data/subBrands.js` - NEW: Sub-brands configuration
- `frontend/src/components/OrderForm.js` - Added sub-brand selector with images
- `frontend/public/brands/*.svg` - NEW: Brand logo placeholders

## Usage

### Creating an Order with Sub-Brand

1. Go to **New Order** page
2. Select a **Sub-Brand** by clicking on a brand card
3. Select **Customer**
4. Add products to the order
5. Click **Create Order**

### Switching Language

1. Look at the sidebar (left side)
2. At the bottom, click **TR**, **EN**, or **AR**
3. All text updates immediately

## Persistence After Git Deployment

### Language Settings
- Language preference is stored in React state (resets on page reload)
- To persist: Add localStorage to LanguageContext

### Sub-Brands
- Brand logos in `public/brands/` are included in Git
- Sub-brand configuration in `subBrands.js` is included in Git
- Database `sub_brand_id` is stored with orders

## Troubleshooting

### Language not changing?
- Check browser console for errors
- Verify LanguageProvider wraps the App component

### Brand logos not showing?
- Check file paths: Should be `/brands/logo-name.svg`
- Verify files exist in `frontend/public/brands/`
- Check browser Network tab for 404 errors

### Sub-brand not saving?
- Check backend logs for database errors
- Verify `sub_brand_id` column exists in orders table
- Restart backend to apply schema changes

## Future Enhancements

- [ ] Add more brand logos
- [ ] Persist language preference in localStorage
- [ ] Add brand filtering in orders list
- [ ] Show brand logo in orders list
- [ ] Add brand-specific pricing
