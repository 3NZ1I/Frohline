import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import jsPDF from 'jspdf';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Production types with their speeds
const PRODUCTION_TYPES = [
  { name: '60LIK 3ODACIKLI L KASA PROFİLİ', speed: 2.9 },
  { name: '60LIK 3ODACIKLI ORTA KAYIT PROFİLİ', speed: 2.7 },
  { name: '60LIK 3ODACIKLI PENCERE KANAT PROFİLİ', speed: 2.8 },
  { name: '60LIK 3ODACIKLI KAPI KANAT PROFİLİ', speed: 2.5 },
  { name: '60LIK 3ODACIKLI PERVAZLI KASA PROFİLİ', speed: 2.7 },
  { name: '60LIK 4ODACIKLI PERVAZLI KASA PROFİLİ', speed: 2.7 },
  { name: 'TEK CAM ÇITASI', speed: 2.9 },
  { name: 'ÇİFT CAM ÇITASI', speed: 2.9 },
  { name: '2,4 MM SÜRME ÇİFTLİ KASA PROFİLİ', speed: 2.8 },
  { name: '2 MM SÜRME ÇİFTLİ KASA PROFİLİ', speed: 2.7 },
  { name: '2 MM SÜRME PERVAZLI KASA PROFİLİ', speed: 2.6 },
  { name: '2,4 MM SÜRME PERVAZLI KASA PROFİLİ PROFİLİ', speed: 2.6 },
  { name: '1,5 MM SÜRME U KASA PROFİLİ PROFİLİ', speed: 2.5 },
  { name: '2 MM SÜRME SİNEKLİKLİ PERVAZLI KASA PROFİLİ', speed: 2.3 },
  { name: '2,4 MM SÜRME PENCERE KANAT PROFİLİ', speed: 2.5 },
  { name: '2 MM SÜRME PENCERE KANAT PROFİLİ', speed: 2.4 },
  { name: '2 MM SÜRME ORTA KAYIT PROFİLİ', speed: 2.8 },
  { name: '2 MM SÜRME TEKLİ KASA KAPAMA PROFİLİ', speed: 2.6 },
  { name: '2 MM SÜRME SİNEKLİKLİ PENCERE KANAT PROFİLİ', speed: 2.5 },
  { name: '2 MM SÜRME KİLİTLEME PROFİLİ', speed: 3.5 },
  { name: 'SÜRME TEK CAM ÇITASI+70LİK ÇİFT CAM', speed: 2.8 },
  { name: 'SÜRME ÇİFT CAM ÇITASI', speed: 2.9 },
  { name: '2 MM DÜZ 4 ODA KASA PROFİLİ', speed: 2.6 },
  { name: '2 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ', speed: 2.7 },
  { name: '2 MM DÜZ 4 ODA KAPI KANAT PROFİLİ', speed: 2.7 },
  { name: '2 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ', speed: 2.7 },
  { name: '2 MM DÜZ 4 ODA PERVAZLI KASA PROFİLİ', speed: 2.7 },
  { name: '1,7 MM DÜZ 4 ODA KASA PROFİLİ', speed: 2.7 },
  { name: '1,7 MM DÜZ 4 ODA ORTA KAYIT PROFİLİ', speed: 2.65 },
  { name: '1,7 MM DÜZ 4 ODA PENCERE KANAT PROFİLİ', speed: 2.65 },
  { name: '1,7 MM DÜZ 4 ODA KAPI KANAT PROFİLİ', speed: 2.3 },
  { name: '4 ODA DÜZ 1,7MM PERVAZLI KASA PROFİLİ', speed: 2.7 },
  { name: '24 MM OVAL ÇITA BEYAZ', speed: 2.95 },
  { name: 'DÜZ TEK CAM', speed: 2.95 },
  { name: 'DÜZ ÇİFT CAM', speed: 2.95 },
  { name: '60LIK 4ODACIKLI PLATİNİUM L KASA PROFİLİ', speed: 2.8 },
  { name: '60LIK 4ODACIKLI PLATİNİUM ORTA KAYIT PROFİLİ', speed: 2.65 },
  { name: '60LIK 4ODACIKLI PLATİNİUM PENCERE KANAT PROFİLİ', speed: 2.65 },
  { name: '60LIK 4ODACIKLI PLATİNİUM KAPI KANAT PROFİLİ', speed: 2.5 },
  { name: '60LIK 4ODACIKLI PLATİNİUM PERVAZLI KASA PROFİLİ', speed: 2.6 },
  { name: '70LİK 4ODACIKLI L KASA PROFİLİ', speed: 2.5 },
  { name: '70LİK 4ODACIKLI ORTA KAYIT PROFİLİ', speed: 2.6 },
  { name: '70LİK 4ODACIKLI PERVAZLI KASA PROFİLİ', speed: 2.6 },
  { name: '70LİK 5ODACIKLI L KASA PROFİLİ', speed: 2.6 },
  { name: '70LİK 5ODACIKLI ORTA KAYIT PROFİLİ', speed: 2.6 },
  { name: '70LİK 5ODACIKLI PERVAZLI KASA PROFİLİ', speed: 2.5 },
  { name: 'HAREKETLİ ORTA KAYIT', speed: 2.9 },
  { name: 'U KASA PROFİLİ 40LIK', speed: 2.7 },
  { name: 'KUTU PROFİLİ', speed: 2.6 },
  { name: '10\'LUK LAMBRİ', speed: 2.5 },
  { name: 'KÖŞE DÖNÜŞ (BORU) PROFİLİ', speed: 2.2 },
  { name: 'KÖŞE DÖNÜŞ ADAPTÖRÜ BEYAZ', speed: 2.5 },
  { name: '60*90 PERVAZ PROFİLİ', speed: 2.2 },
  { name: '70LİK TEK CAM ÇITASI', speed: 2.9 },
  { name: '2,9 MM 70LİK KASA PROFİLİ', speed: 2.5 },
  { name: '2,9 MM 70LİK ORTA KAYIT PROFİLİ', speed: 2.5 },
  { name: '2,9 MM 70LİK PENCERE KANAT PROFİLİ', speed: 2.5 },
  { name: '2,9 MM 70LİK KAPI KANAT PROFİLİ', speed: 2.2 },
  { name: '2,9 MM 70LİK PERVAZLI KASA PROFİLİ', speed: 2.3 },
];

function ProductionDetails() {
  const { language } = useLanguage();
  const [view, setView] = useState('form'); // 'form' or 'reports'
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [createdBy, setCreatedBy] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, weekly, monthly, annual
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // 8 production lines
  const [lines, setLines] = useState([
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
    { type: '', speed: '', expected: '', actual: '', notes: '' },
  ]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await API.get('/production-reports', { params: { limit: 500 } });
      let allReports = response.data;
      
      // Filter by period
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      
      if (filterPeriod === 'weekly') {
        allReports = allReports.filter(r => new Date(r.report_date) >= oneWeekAgo);
      } else if (filterPeriod === 'monthly') {
        allReports = allReports.filter(r => new Date(r.report_date) >= oneMonthAgo);
      } else if (filterPeriod === 'annual') {
        allReports = allReports.filter(r => new Date(r.report_date) >= oneYearAgo);
      }
      
      setReports(allReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleLineChange = (lineIndex, field, value) => {
    const newLines = [...lines];
    newLines[lineIndex][field] = value;
    
    // Auto-fill speed when production type is selected
    if (field === 'type') {
      const selectedType = PRODUCTION_TYPES.find(t => t.name === value);
      if (selectedType) {
        newLines[lineIndex].speed = selectedType.speed.toString();
      }
    }
    
    setLines(newLines);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post('/production-reports', {
        report_date: reportDate,
        created_by: createdBy || 'Unknown',
        lines: lines,
      });

      alert('Production report saved successfully!');
      // Reset form
      setLines([
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
        { type: '', speed: '', expected: '', actual: '', notes: '' },
      ]);
      loadReports();
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error saving production report');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await API.delete(`/production-reports/${id}`);
        loadReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };

  const handleViewReport = async (id) => {
    try {
      const response = await API.get(`/production-reports/${id}`);
      const report = response.data;
      
      setReportDate(report.report_date);
      setCreatedBy(report.created_by);
      setLines([
        { type: report.line_1_type, speed: report.line_1_speed, expected: report.line_1_expected, actual: report.line_1_actual, notes: report.line_1_notes },
        { type: report.line_2_type, speed: report.line_2_speed, expected: report.line_2_expected, actual: report.line_2_actual, notes: report.line_2_notes },
        { type: report.line_3_type, speed: report.line_3_speed, expected: report.line_3_expected, actual: report.line_3_actual, notes: report.line_3_notes },
        { type: report.line_4_type, speed: report.line_4_speed, expected: report.line_4_expected, actual: report.line_4_actual, notes: report.line_4_notes },
        { type: report.line_5_type, speed: report.line_5_speed, expected: report.line_5_expected, actual: report.line_5_actual, notes: report.line_5_notes },
        { type: report.line_6_type, speed: report.line_6_speed, expected: report.line_6_expected, actual: report.line_6_actual, notes: report.line_6_notes },
        { type: report.line_7_type, speed: report.line_7_speed, expected: report.line_7_expected, actual: report.line_7_actual, notes: report.line_7_notes },
        { type: report.line_8_type, speed: report.line_8_speed, expected: report.line_8_expected, actual: report.line_8_actual, notes: report.line_8_notes },
      ]);
      setView('form');
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  // Multi-select handlers
  const toggleSelectReport = (id) => {
    const newSelected = new Set(selectedReports);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedReports(newSelected);
    setSelectAll(newSelected.size === reports.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedReports(new Set());
      setSelectAll(false);
    } else {
      setSelectedReports(new Set(reports.map(r => r.id)));
      setSelectAll(true);
    }
  };

  // Export selected reports to PDF with full details
  const handleExportPDF = async () => {
    if (selectedReports.size === 0) {
      alert('Please select at least one report to export');
      return;
    }

    const pdfLabels = {
      en: { title: 'Production Report', date: 'Date', line: 'Line', type: 'Production Type', speed: 'Speed', expected: 'Expected', actual: 'Actual', difference: 'Difference', notes: 'Notes', totalExpected: 'Total Expected', totalActual: 'Total Actual', totalDifference: 'Total Difference', efficiency: 'Efficiency', createdBy: 'Created By' },
      tr: { title: 'Üretim Raporu', date: 'Tarih', line: 'Hat', type: 'Üretim Tipi', speed: 'Hız', expected: 'Beklenen', actual: 'Gerçekleşen', difference: 'Fark', notes: 'Notlar', totalExpected: 'Toplam Beklenen', totalActual: 'Toplam Gerçekleşen', totalDifference: 'Toplam Fark', efficiency: 'Verimlilik', createdBy: 'Oluşturan' },
      ar: { title: 'تقرير الإنتاج', date: 'التاريخ', line: 'الخط', type: 'نوع الإنتاج', speed: 'السرعة', expected: 'المتوقع', actual: 'الفعلي', difference: 'الفرق', notes: 'ملاحظات', totalExpected: 'إجمالي المتوقع', totalActual: 'إجمالي الفعلي', totalDifference: 'إجمالي الفرق', efficiency: 'الكفاءة', createdBy: 'أنشأ بواسطة' },
    };

    const l = pdfLabels[language] || pdfLabels.en;
    const fileName = `Production_Report_${new Date().toISOString().split('T')[0]}.pdf`;

    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 15;
      let pageNum = 1;

      const selectedReportsList = reports.filter(r => selectedReports.has(r.id));

      selectedReportsList.forEach((report, reportIndex) => {
        // Add page break for each report (except first)
        if (reportIndex > 0) {
          pdf.addPage();
          yPos = 15;
          pageNum++;
        }

        // Calculate report totals
        const totalExpected = report.line_1_expected + report.line_2_expected + report.line_3_expected + report.line_4_expected +
                             report.line_5_expected + report.line_6_expected + report.line_7_expected + report.line_8_expected;
        const totalActual = report.line_1_actual + report.line_2_actual + report.line_3_actual + report.line_4_actual +
                           report.line_5_actual + report.line_6_actual + report.line_7_actual + report.line_8_actual;
        const totalDiff = totalActual - totalExpected;
        const efficiency = totalExpected > 0 ? ((totalActual / totalExpected) * 100).toFixed(1) : 0;

        // Header
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text(`${l.title} - ${new Date(report.report_date).toLocaleDateString()}`, 15, yPos);
        yPos += 8;

        // Info section
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`${l.createdBy}: ${report.created_by}`, 15, yPos);
        yPos += 6;

        // Lines table header
        pdf.setFont(undefined, 'bold');
        pdf.text(l.line, 15, yPos);
        pdf.text(l.type, 35, yPos);
        pdf.text(l.speed, 80, yPos);
        pdf.text(l.expected, 110, yPos);
        pdf.text(l.actual, 140, yPos);
        pdf.text(l.difference, 170, yPos);
        yPos += 6;

        // Draw header line
        pdf.line(15, yPos, 260, yPos);
        yPos += 6;

        // Lines data
        pdf.setFont(undefined, 'normal');
        const lines = [
          { type: report.line_1_type, speed: report.line_1_speed, expected: report.line_1_expected, actual: report.line_1_actual, notes: report.line_1_notes },
          { type: report.line_2_type, speed: report.line_2_speed, expected: report.line_2_expected, actual: report.line_2_actual, notes: report.line_2_notes },
          { type: report.line_3_type, speed: report.line_3_speed, expected: report.line_3_expected, actual: report.line_3_actual, notes: report.line_3_notes },
          { type: report.line_4_type, speed: report.line_4_speed, expected: report.line_4_expected, actual: report.line_4_actual, notes: report.line_4_notes },
          { type: report.line_5_type, speed: report.line_5_speed, expected: report.line_5_expected, actual: report.line_5_actual, notes: report.line_5_notes },
          { type: report.line_6_type, speed: report.line_6_speed, expected: report.line_6_expected, actual: report.line_6_actual, notes: report.line_6_notes },
          { type: report.line_7_type, speed: report.line_7_speed, expected: report.line_7_expected, actual: report.line_7_actual, notes: report.line_7_notes },
          { type: report.line_8_type, speed: report.line_8_speed, expected: report.line_8_expected, actual: report.line_8_actual, notes: report.line_8_notes },
        ];

        lines.forEach((line, i) => {
          if (yPos > pageHeight - 40) {
            pdf.addPage();
            yPos = 15;
            pageNum++;
          }
          const diff = line.actual - line.expected;
          const lineLabel = language === 'tr' ? `${i + 1}. Hat` : language === 'ar' ? `الخط ${i + 1}` : `Line ${i + 1}`;
          pdf.text(lineLabel, 15, yPos);
          pdf.text(line.type || '-', 35, yPos);
          pdf.text(line.speed ? line.speed.toString() : '0', 80, yPos);
          pdf.text(line.expected ? line.expected.toFixed(1) : '0', 110, yPos);
          pdf.text(line.actual ? line.actual.toFixed(1) : '0', 140, yPos);
          pdf.setTextColor(diff >= 0 ? 0 : 255, diff >= 0 ? 128 : 0, 0);
          pdf.text((diff >= 0 ? '+' : '') + diff.toFixed(1), 170, yPos);
          pdf.setTextColor(0, 0, 0);
          yPos += 6;
        });

        // Totals section
        yPos += 5;
        pdf.line(15, yPos, 260, yPos);
        yPos += 8;

        pdf.setFont(undefined, 'bold');
        pdf.text(`${l.totalExpected}: ${totalExpected.toFixed(1)} m`, 15, yPos);
        pdf.text(`${l.totalActual}: ${totalActual.toFixed(1)} m`, 80, yPos);
        pdf.text(`${l.totalDifference}: ${(totalDiff >= 0 ? '+' : '') + totalDiff.toFixed(1)} m`, 140, yPos);
        yPos += 8;
        pdf.setTextColor(totalDiff >= 0 ? 0 : 255, totalDiff >= 0 ? 128 : 0, 0);
        pdf.text(`${l.efficiency}: ${efficiency}%`, 15, yPos);
        pdf.setTextColor(0, 0, 0);
        yPos += 10;

        // Notes section
        const allNotes = lines.map((l, i) => {
          if (!l.notes) return null;
          const lineLabel = language === 'tr' ? `${i + 1}. Hat` : language === 'ar' ? `الخط ${i + 1}` : `Line ${i + 1}`;
          return `${lineLabel}: ${l.notes}`;
        }).filter(n => n);
        if (allNotes.length > 0) {
          pdf.setFont(undefined, 'bold');
          pdf.text(`${l.notes}:`, 15, yPos);
          yPos += 6;
          pdf.setFont(undefined, 'normal');
          allNotes.forEach(note => {
            if (yPos > pageHeight - 20) {
              pdf.addPage();
              yPos = 15;
              pageNum++;
            }
            pdf.text(`• ${note}`, 20, yPos);
            yPos += 5;
          });
        }

        // Page footer
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Page ${pageNum}`, pageWidth - 30, pageHeight - 10);
      });

      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    }
  };

  // Translations
  const labels = {
    en: {
      title: '🏭 Production Details',
      newReport: '➕ New Report',
      viewReports: '📋 View Reports',
      reportDate: 'Report Date',
      createdBy: 'Created By',
      line: 'Line',
      productionType: 'Production Type',
      speed: 'Speed (m/min)',
      expected: 'Expected (m)',
      actual: 'Actual (m)',
      difference: 'Difference (m)',
      notes: 'Notes',
      save: '💾 Save Report',
      cancel: 'Cancel',
      delete: '🗑️ Delete',
      view: '👁️ View',
      noReports: 'No production reports yet',
      totalExpected: 'Total Expected',
      totalActual: 'Total Actual',
      totalDifference: 'Total Difference',
      efficiency: 'Efficiency',
      filter: 'Filter',
      all: 'All',
      weekly: 'Weekly',
      monthly: 'Monthly',
      annual: 'Annual',
      selectAll: 'Select All',
      exportPDF: '📄 Export Selected as PDF',
      date: 'Date',
      reports: 'Reports',
    },
    tr: {
      title: '🏭 Üretim Detayları',
      newReport: '➕ Yeni Rapor',
      viewReports: '📋 Raporları Görüntüle',
      reportDate: 'Rapor Tarihi',
      createdBy: 'Oluşturan',
      line: 'Hat',
      productionType: 'Üretim Tipi',
      speed: 'Hız (m/dk)',
      expected: 'Beklenen (m)',
      actual: 'Gerçekleşen (m)',
      difference: 'Fark (m)',
      notes: 'Notlar',
      save: '💾 Raporu Kaydet',
      cancel: 'İptal',
      delete: '🗑️ Sil',
      view: '👁️ Görüntüle',
      noReports: 'Henüz üretim raporu yok',
      totalExpected: 'Toplam Beklenen',
      totalActual: 'Toplam Gerçekleşen',
      totalDifference: 'Toplam Fark',
      efficiency: 'Verimlilik',
      filter: 'Filtre',
      all: 'Tümü',
      weekly: 'Haftalık',
      monthly: 'Aylık',
      annual: 'Yıllık',
      selectAll: 'Tümünü Seç',
      exportPDF: '📄 Seçilenleri PDF Olarak Dışa Aktar',
      date: 'Tarih',
      reports: 'Raporlar',
    },
    ar: {
      title: '🏭 تفاصيل الإنتاج',
      newReport: '➕ تقرير جديد',
      viewReports: '📋 عرض التقارير',
      reportDate: 'تاريخ التقرير',
      createdBy: 'أنشأ بواسطة',
      line: 'الخط',
      productionType: 'نوع الإنتاج',
      speed: 'السرعة (م/دقيقة)',
      expected: 'المتوقع (م)',
      actual: 'الفعلي (م)',
      difference: 'الفرق (م)',
      notes: 'ملاحظات',
      save: '💾 حفظ التقرير',
      cancel: 'إلغاء',
      delete: '🗑️ حذف',
      view: '👁️ عرض',
      noReports: 'لا توجد تقارير إنتاج بعد',
      totalExpected: 'إجمالي المتوقع',
      totalActual: 'إجمالي الفعلي',
      totalDifference: 'إجمالي الفرق',
      efficiency: 'الكفاءة',
      filter: 'تصفية',
      all: 'الكل',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      annual: 'سنوي',
      selectAll: 'تحديد الكل',
      exportPDF: '📄 تصدير المحدد كـ PDF',
      date: 'التاريخ',
      reports: 'التقارير',
    },
  };

  const l = labels[language] || labels.en;
  const isRTL = language === 'ar';

  // Calculate totals
  const totalExpected = lines.reduce((sum, line) => sum + (parseFloat(line.expected) || 0), 0);
  const totalActual = lines.reduce((sum, line) => sum + (parseFloat(line.actual) || 0), 0);
  const totalDifference = totalActual - totalExpected;
  const efficiency = totalExpected > 0 ? ((totalActual / totalExpected) * 100).toFixed(1) : 0;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="d-flex justify-content-between align-items-center mb-4" style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <h2>{l.title}</h2>
        <div className="btn-group" role="group" dir="ltr">
          <button
            className={`btn ${view === 'form' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setView('form')}
          >
            {l.newReport}
          </button>
          <button
            className={`btn ${view === 'reports' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setView('reports')}
          >
            {l.viewReports}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <form onSubmit={handleSubmit}>
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">{l.reportDate}</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">{l.reportDate} *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">{l.createdBy}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={createdBy}
                    onChange={(e) => setCreatedBy(e.target.value)}
                    placeholder="Technician name"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Production Lines Table */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered" dir="ltr">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>{l.line}</th>
                      <th style={{ width: '200px' }}>{l.productionType}</th>
                      <th style={{ width: '120px' }}>{l.speed}</th>
                      <th style={{ width: '120px' }}>{l.expected}</th>
                      <th style={{ width: '120px' }}>{l.actual}</th>
                      <th style={{ width: '120px' }}>{l.difference}</th>
                      <th>{l.notes}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => {
                      const expected = parseFloat(line.expected) || 0;
                      const actual = parseFloat(line.actual) || 0;
                      const difference = actual - expected;
                      const diffClass = difference >= 0 ? 'text-success' : 'text-danger';

                      return (
                        <tr key={index}>
                          <td className="text-center fw-bold">Line {index + 1}</td>
                          <td>
                            <select
                              className="form-control form-control-sm"
                              value={line.type}
                              onChange={(e) => handleLineChange(index, 'type', e.target.value)}
                            >
                              <option value="">-- Select Type --</option>
                              {PRODUCTION_TYPES.map((type, i) => (
                                <option key={i} value={type.name}>
                                  {type.name} ({type.speed} m/min)
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={line.speed}
                              onChange={(e) => handleLineChange(index, 'speed', e.target.value)}
                              placeholder="0.0"
                              readOnly
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={line.expected}
                              onChange={(e) => handleLineChange(index, 'expected', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={line.actual}
                              onChange={(e) => handleLineChange(index, 'actual', e.target.value)}
                              placeholder="0"
                            />
                          </td>
                          <td className={`fw-bold ${diffClass}`}>
                            {difference >= 0 ? '+' : ''}{difference.toFixed(1)}
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={line.notes}
                              onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                              placeholder="Notes..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-light">
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">{l.totalExpected}:</td>
                      <td className="fw-bold">{totalExpected.toFixed(1)} m</td>
                      <td className="fw-bold">{totalActual.toFixed(1)} m</td>
                      <td className={`fw-bold ${totalDifference >= 0 ? 'text-success' : 'text-danger'}`}>
                        {totalDifference >= 0 ? '+' : ''}{totalDifference.toFixed(1)} m
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">{l.efficiency}:</td>
                      <td colSpan="4" className={`fw-bold ${efficiency >= 100 ? 'text-success' : efficiency >= 80 ? 'text-warning' : 'text-danger'}`}>
                        {efficiency}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Saving...' : l.save}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => {
                setLines([
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                  { type: '', speed: '', expected: '', actual: '', notes: '' },
                ]);
              }}
            >
              {l.cancel}
            </button>
          </div>
        </form>
      ) : (
        /* Reports List */
        <div>
          <div className="card">
            <div className="card-body">
              {/* Filter and Actions Toolbar */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="btn-group" role="group" dir="ltr">
                  <button
                    className={`btn btn-sm ${filterPeriod === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilterPeriod('all')}
                  >
                    {l.all}
                  </button>
                  <button
                    className={`btn btn-sm ${filterPeriod === 'weekly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilterPeriod('weekly')}
                  >
                    {l.weekly}
                  </button>
                  <button
                    className={`btn btn-sm ${filterPeriod === 'monthly' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilterPeriod('monthly')}
                  >
                    {l.monthly}
                  </button>
                  <button
                    className={`btn btn-sm ${filterPeriod === 'annual' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setFilterPeriod('annual')}
                  >
                    {l.annual}
                  </button>
                </div>
                {selectedReports.size > 0 && (
                  <button className="btn btn-sm btn-success" onClick={handleExportPDF}>
                    {l.exportPDF} ({selectedReports.size})
                  </button>
                )}
              </div>

              <div className="table-responsive">
                <table className="table table-hover" dir={isRTL ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>{l.date}</th>
                      <th>{l.createdBy}</th>
                      <th>{l.totalExpected}</th>
                      <th>{l.totalActual}</th>
                      <th>{l.difference}</th>
                      <th>{l.actions || 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          {l.noReports}
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => {
                        const reportTotalExpected = 
                          report.line_1_expected + report.line_2_expected + report.line_3_expected + report.line_4_expected +
                          report.line_5_expected + report.line_6_expected + report.line_7_expected + report.line_8_expected;
                        const reportTotalActual = 
                          report.line_1_actual + report.line_2_actual + report.line_3_actual + report.line_4_actual +
                          report.line_5_actual + report.line_6_actual + report.line_7_actual + report.line_8_actual;
                        const reportDifference = reportTotalActual - reportTotalExpected;

                        return (
                          <tr key={report.id}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={selectedReports.has(report.id)}
                                onChange={() => toggleSelectReport(report.id)}
                              />
                            </td>
                            <td>{new Date(report.report_date).toLocaleDateString()}</td>
                            <td>{report.created_by}</td>
                            <td>{reportTotalExpected.toFixed(1)} m</td>
                            <td>{reportTotalActual.toFixed(1)} m</td>
                            <td className={reportDifference >= 0 ? 'text-success' : 'text-danger'}>
                              {reportDifference >= 0 ? '+' : ''}{reportDifference.toFixed(1)} m
                            </td>
                            <td dir="ltr">
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => handleViewReport(report.id)}
                              >
                                {l.view}
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(report.id)}
                              >
                                {l.delete}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductionDetails;
