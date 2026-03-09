import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

function ProductionDetails() {
  const { language } = useLanguage();
  const [view, setView] = useState('form'); // 'form' or 'reports'
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [createdBy, setCreatedBy] = useState('');
  
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
      const response = await API.get('/production-reports', { params: { limit: 50 } });
      setReports(response.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleLineChange = (lineIndex, field, value) => {
    const newLines = [...lines];
    newLines[lineIndex][field] = value;
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
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={line.type}
                              onChange={(e) => handleLineChange(index, 'type', e.target.value)}
                              placeholder="Type"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.1"
                              className="form-control form-control-sm"
                              value={line.speed}
                              onChange={(e) => handleLineChange(index, 'speed', e.target.value)}
                              placeholder="0.0"
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
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover" dir={isRTL ? 'rtl' : 'ltr'}>
                <thead>
                  <tr>
                    <th>{l.reportDate}</th>
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
                      <td colSpan="6" className="text-center text-muted py-4">
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
      )}
    </div>
  );
}

export default ProductionDetails;
