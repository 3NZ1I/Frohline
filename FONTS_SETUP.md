# Chillax Font Setup

## Download Chillax Font

The Chillax font needs to be downloaded and placed in the `frontend/public/fonts/` folder.

### Option 1: Download from Font Source

1. Download Chillax font from: https://fontshare.com/fonts/chillax
2. Extract the ZIP file
3. Copy the following files to `frontend/public/fonts/`:
   - `Chillax-Regular.woff2`
   - `Chillax-Medium.woff2`
   - `Chillax-SemiBold.woff2`
   - `Chillax-Bold.woff2`

### Option 2: Use Google Fonts Alternative (Temporary)

If you don't have Chillax font files yet, the system will fallback to system fonts.

To use a similar font from Google Fonts, edit `frontend/src/index.css` and replace:

```css
font-family: 'Chillax', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
```

With:

```css
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');

font-family: 'Manrope', sans-serif;
```

Manrope is similar to Chillax and available free from Google Fonts.

### Verify Font Loading

After copying font files:

1. Restart Docker: `docker restart oms-frontend`
2. Open browser DevTools (F12)
3. Go to Network tab
4. Refresh page
5. Look for `.woff2` files loading successfully

### Font Files Structure

```
frontend/public/fonts/
├── Chillax-Regular.woff2
├── Chillax-Medium.woff2
├── Chillax-SemiBold.woff2
└── Chillax-Bold.woff2
```
