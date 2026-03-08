# How to Copy Brand Images

## Option 1: Using the Batch Script (Windows)

1. **Double-click** the file: `copy-brands.bat`
2. It will automatically copy all images from:
   - `D:\Frohline\order-management-system\frontend\brands\`
   - To: `frontend\public\brands\`
3. **Restart Docker**:
   ```bash
   docker-compose restart
   ```
   Or:
   ```bash
   docker restart oms-frontend
   ```

## Option 2: Manual Copy (Windows to WSL/Linux)

### Step 1: Copy files to WSL
Open **PowerShell** or **Command Prompt** and run:

```powershell
# Create destination directory
wsl mkdir -p /home/bashar/order-management-system/frontend/public/brands

# Copy all brand images
wsl cp -r "D:/Frohline/order-management-system/frontend/brands/"* /home/bashar/order-management-system/frontend/public/brands/
```

### Step 2: Restart Docker
```bash
docker restart oms-frontend
```

## Option 3: Docker Volume Mount (Recommended for Development)

Update your `docker-compose.yml` to mount the brands folder:

```yaml
services:
  frontend:
    volumes:
      - ./frontend:/app
      - ./frontend/public/brands:/app/public/brands
      - /app/node_modules
```

Then restart:
```bash
docker-compose down
docker-compose up -d
```

## Verify Images are Loaded

1. Open http://localhost:3000/orders/new
2. Look for the "Sub Brand" dropdown
3. Select a brand
4. You should see the brand logo preview

## Supported Image Formats

- `.png` - Recommended (transparent background)
- `.jpg` / `.jpeg`
- `.svg` - Best quality (vector)
- `.gif`

## Image Recommendations

- **Size**: 150x60 pixels (or similar aspect ratio)
- **Format**: PNG with transparent background
- **File size**: Keep under 100KB for fast loading
- **Naming**: `brandname-logo.png` (lowercase, hyphens)

## Troubleshooting

### Images not showing?

1. **Check files exist**:
   ```bash
   ls -la /home/bashar/order-management-system/frontend/public/brands/
   ```

2. **Check file paths** in `frontend/src/data/subBrands.js`:
   ```javascript
   logo: '/brands/yourbrand-logo.png',
   ```

3. **Check browser console** (F12) for 404 errors

4. **Restart frontend**:
   ```bash
   docker restart oms-frontend
   ```

### Logo shows colored box instead?

- This is the fallback when image fails to load
- Check that the filename in `subBrands.js` matches the actual file
- Verify the image file is not corrupted

## Current Brand Configuration

Edit `frontend/src/data/subBrands.js` to update:

```javascript
{
  id: 'frohline',
  name: {
    tr: 'Frohline',
    en: 'Frohline',
    ar: 'فرولين',
  },
  logo: '/brands/frohline-logo.svg',  // Update this path
  color: '#0066cc',  // Fallback color
},
```
