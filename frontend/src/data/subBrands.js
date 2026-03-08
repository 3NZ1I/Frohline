// Sub-brands configuration
// Brand logos are loaded from /public/brands/ folder
// Images copied from: D:\Frohline\order-management-system\frontend\brands\

export const subBrands = [
  {
    id: 'frohline',
    name: {
      tr: 'Frohline',
      en: 'Frohline',
      ar: 'فرولين',
    },
    logo: '/brands/frohline logo.png',
    color: '#0066cc',
  },
  {
    id: 'al_amir',
    name: {
      tr: 'Al Amir Plast',
      en: 'Al Amir Plast',
      ar: 'الأمير بلاست',
    },
    logo: '/brands/al amir plast.png',
    color: '#ff6600',
  },
  {
    id: 'avalon',
    name: {
      tr: 'Avalon',
      en: 'Avalon',
      ar: 'أفالون',
    },
    logo: '/brands/avalon.png',
    color: '#9b59b6',
  },
  {
    id: 'golden_house',
    name: {
      tr: 'Golden House',
      en: 'Golden House',
      ar: 'جولدن هاوس',
    },
    logo: '/brands/golden house.png',
    color: '#f1c40f',
  },
  {
    id: 'kartalpen',
    name: {
      tr: 'Kartalpen',
      en: 'Kartalpen',
      ar: 'كارتالبين',
    },
    logo: '/brands/kartalpen.png',
    color: '#e74c3c',
  },
  {
    id: 'maria_plast',
    name: {
      tr: 'Maria Plast',
      en: 'Maria Plast',
      ar: 'ماريا بلاست',
    },
    logo: '/brands/maria plast.png',
    color: '#1abc9c',
  },
  {
    id: 'my_house',
    name: {
      tr: 'My House',
      en: 'My House',
      ar: 'ماي هاوس',
    },
    logo: '/brands/my house.png',
    color: '#3498db',
  },
  {
    id: 'panorama',
    name: {
      tr: 'Panorama',
      en: 'Panorama',
      ar: 'بانوراما',
    },
    logo: '/brands/panorama.png',
    color: '#2ecc71',
  },
  {
    id: 'pvc_saryi',
    name: {
      tr: 'PVC Sarayı',
      en: 'PVC Palace',
      ar: 'قصر بي في سي',
    },
    logo: '/brands/pvc saryi.png',
    color: '#f39c12',
  },
  {
    id: 'rosella',
    name: {
      tr: 'Rosella',
      en: 'Rosella',
      ar: 'روزيللا',
    },
    logo: '/brands/rosella.png',
    color: '#e91e63',
  },
  {
    id: 'royal_house',
    name: {
      tr: 'Royal House',
      en: 'Royal House',
      ar: 'رويال هاوس',
    },
    logo: '/brands/royal house.png',
    color: '#9c27b0',
  },
  {
    id: 'seda_pen',
    name: {
      tr: 'Seda Pen',
      en: 'Seda Pen',
      ar: 'سيدا بين',
    },
    logo: '/brands/seda pen.png',
    color: '#00bcd4',
  },
  {
    id: 'sedoor',
    name: {
      tr: 'Sedoor',
      en: 'Sedoor',
      ar: 'سيدور',
    },
    logo: '/brands/sedoor.png',
    color: '#ff5722',
  },
  {
    id: 'super_house',
    name: {
      tr: 'Super House',
      en: 'Super House',
      ar: 'سوبر هاوس',
    },
    logo: '/brands/super house.png',
    color: '#607d8b',
  },
  {
    id: 'wined_pen',
    name: {
      tr: 'Wined Pen',
      en: 'Wined Pen',
      ar: 'وايند بين',
    },
    logo: '/brands/wined pen.png',
    color: '#795548',
  },
  {
    id: 'other',
    name: {
      tr: 'Diğer',
      en: 'Other',
      ar: 'آخر',
    },
    logo: null,
    color: '#666666',
  },
];

export function getSubBrandName(subBrandId, language = 'tr') {
  const brand = subBrands.find(b => b.id === subBrandId);
  if (!brand) return subBrandId;
  return brand.name[language] || brand.name.en || subBrandId;
}

export function getSubBrandLogo(subBrandId) {
  const brand = subBrands.find(b => b.id === subBrandId);
  return brand?.logo || null;
}
