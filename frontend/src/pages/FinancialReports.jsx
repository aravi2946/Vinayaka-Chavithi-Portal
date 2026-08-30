import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText, Download, Wallet, TrendingUp, Calendar, AlertTriangle, FileSpreadsheet } from 'lucide-react';

const FinancialReports = () => {
  const { user, settings, triggerToast } = useAuth();
  const [collections, setCollections] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = user.token;
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load collections (approved only)
      const colRes = await fetch(`${API_URL}/collections?approvalStatus=Approved`, { headers });
      const cols = colRes.ok ? await colRes.json() : [];
      setCollections(cols);

      // Load expenses (approved only)
      const expRes = await fetch(`${API_URL}/expenses?approvalStatus=Approved`, { headers });
      const exps = expRes.ok ? await expRes.json() : [];
      setExpenses(exps);

      // Load financial dashboard metrics
      const statRes = await fetch(`${API_URL}/expenses/dashboard`, { headers });
      const statData = statRes.ok ? await statRes.json() : null;
      setStats(statData);

      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading report logs', 'danger');
      setLoading(false);
    }
  };

  // ==========================================
  // PDF REPORT GENERATOR
  // ==========================================
  const downloadPDFReport = (reportType) => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Helper: Add Logo / Title Banner (Ganesha themed accent colors)
    const addPDFHeader = (title) => {
      doc.setFillColor(26, 25, 23); // Charcoal background
      doc.rect(0, 0, 210, 38, 'F');

      doc.setTextColor(249, 200, 53); // Gold color
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(settings.festivalName.toUpperCase(), 105, 14, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text(settings.committeeName, 105, 21, { align: 'center' });
      doc.text(`Festival Year: ${settings.festivalYear} | Year Dates: ${settings.festivalDates}`, 105, 27, { align: 'center' });

      doc.setFillColor(255, 102, 0); // Saffron line divider
      doc.rect(0, 38, 210, 2, 'F');

      // Title & Date
      doc.setTextColor(26, 25, 23);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(title, 14, 52);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${currentDate}`, 196, 52, { align: 'right' });
      doc.text(`Requested By: @${user.username} (${user.role})`, 196, 57, { align: 'right' });
    };

    // Helper: Add signature footer at the bottom
    const addPDFFooter = (finalY) => {
      const positionY = Math.max(finalY + 25, 250);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, positionY, 70, positionY);
      doc.line(140, positionY, 196, positionY);

      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('TREASURER SIGNATURE', 42, positionY + 5, { align: 'center' });
      doc.text('SUPER ADMIN SIGNATURE', 168, positionY + 5, { align: 'center' });
    };

    // 1. COLLECTION / DONATIONS REPORT
    if (reportType === 'collections') {
      addPDFHeader('APPROVED DONATIONS & COLLECTIONS REPORT');
      
      const tableHeaders = [['Receipt ID', 'Date', 'Donor Name', 'Purpose', 'Payment Mode', 'Reference ID', 'Amount']];
      const tableRows = collections.map((c) => [
        c.collectionId,
        new Date(c.date).toLocaleDateString('en-IN'),
        c.donorName,
        c.purpose,
        c.paymentMode,
        c.transactionRef || '-',
        `INR ${c.amount.toLocaleString('en-IN')}`
      ]);

      // Add Total Row
      const totalCol = collections.reduce((sum, item) => sum + item.amount, 0);
      tableRows.push(['', '', '', '', '', 'TOTAL AMOUNT:', `INR ${totalCol.toLocaleString('en-IN')}`]);

      doc.autoTable({
        startY: 65,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 102, 0] }, // Saffron header
        columnStyles: {
          6: { fontStyle: 'bold', halign: 'right' }
        },
        didParseCell: (data) => {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 240, 230];
          }
        }
      });

      addPDFFooter(doc.lastAutoTable.finalY);
      doc.save(`donations_report_${settings.festivalYear}.pdf`);
    }

    // 2. EXPENSES REPORT
    else if (reportType === 'expenses') {
      addPDFHeader('APPROVED PRIVATE EXPENSES REPORT');
      
      const tableHeaders = [['Expense ID', 'Date', 'Category', 'Paid To', 'Payment Mode', 'Bill/Receipt', 'Amount']];
      const tableRows = expenses.map((e) => [
        e.expenseId,
        new Date(e.date).toLocaleDateString('en-IN'),
        e.expenseCategory,
        e.paidTo,
        e.paymentMode,
        e.billReceiptNo || '-',
        `INR ${e.amount.toLocaleString('en-IN')}`
      ]);

      const totalExp = expenses.reduce((sum, item) => sum + item.amount, 0);
      tableRows.push(['', '', '', '', '', 'TOTAL SPENT:', `INR ${totalExp.toLocaleString('en-IN')}`]);

      doc.autoTable({
        startY: 65,
        head: tableHeaders,
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69] }, // Red header
        columnStyles: {
          6: { fontStyle: 'bold', halign: 'right' }
        },
        didParseCell: (data) => {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [255, 235, 235];
          }
        }
      });

      addPDFFooter(doc.lastAutoTable.finalY);
      doc.save(`expenses_report_${settings.festivalYear}.pdf`);
    }

    // 3. BUDGET VS ACTUAL REPORT
    else if (reportType === 'budget') {
      addPDFHeader('BUDGET TARGETS VS ACTUAL EXPENDITURES');
      
      const tableHeaders = [['Expense Category', 'Budget Target', 'Actual Spending', 'Difference', 'Utilized %']];
      const tableRows = stats.budgetVsActual.map((b) => [
        b.category,
        `INR ${b.budget.toLocaleString('en-IN')}`,
        `INR ${b.actual.toLocaleString('en-IN')}`,
        b.remaining < 0 ? `Over-spent: INR ${Math.abs(b.remaining).toLocaleString('en-IN')}` : `Left: INR ${b.remaining.toLocaleString('en-IN')}`,
        `${b.percentUsed}%`
      ]);

      // Add summary totals
      const totalBudget = stats.budgetVsActual.reduce((sum, item) => sum + item.budget, 0);
      const totalActual = stats.budgetVsActual.reduce((sum, item) => sum + item.actual, 0);
      const diff = totalBudget - totalActual;
      tableRows.push([
        'TOTALS SUMMARY',
        `INR ${totalBudget.toLocaleString('en-IN')}`,
        `INR ${totalActual.toLocaleString('en-IN')}`,
        diff < 0 ? `Over-spent: INR ${Math.abs(diff).toLocaleString('en-IN')}` : `Left: INR ${diff.toLocaleString('en-IN')}`,
        `${Math.round((totalActual / totalBudget) * 100)}%`
      ]);

      doc.autoTable({
        startY: 65,
        head: tableHeaders,
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [26, 25, 23] }, // Charcoal header
        columnStyles: {
          4: { fontStyle: 'bold', halign: 'center' }
        },
        didParseCell: (data) => {
          if (data.row.index === tableRows.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });

      addPDFFooter(doc.lastAutoTable.finalY);
      doc.save(`budget_vs_actual_${settings.festivalYear}.pdf`);
    }

    // 4. FINANCIAL SUMMARY (BALANCE SHEET)
    else if (reportType === 'summary') {
      addPDFHeader('COMMITTEE FINANCIAL SUMMARY SHEET');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('1. KEY BALANCE TOTALS', 14, 68);

      const tableHeaders = [['Account Category', 'Calculated Total (INR)', 'Description Reference']];
      const tableRows = [
        ['Total Collections (Approved)', `INR ${stats.totalCollections.toLocaleString('en-IN')}`, 'Sum of all approved donor contributions.'],
        ['Total Expenses (Approved)', `INR ${stats.totalExpenses.toLocaleString('en-IN')}`, 'Sum of all approved category expenditures.'],
        ['Remaining Cash Reserves', `INR ${stats.remainingBalance.toLocaleString('en-IN')}`, 'Total Collections minus Total Expenses.']
      ];

      doc.autoTable({
        startY: 73,
        head: tableHeaders,
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [255, 102, 0] },
        columnStyles: {
          1: { fontStyle: 'bold' }
        },
        didParseCell: (data) => {
          if (data.row.index === 2) {
            data.cell.styles.fillColor = [230, 245, 230];
          }
        }
      });

      let nextY = doc.lastAutoTable.finalY + 15;
      doc.setFont('Helvetica', 'bold');
      doc.text('2. EXPENDITURES SUMMARY BY CATEGORY', 14, nextY);

      const catHeaders = [['Category Name', 'Target Budget', 'Actual Spent', 'Reserve Status']];
      const catRows = stats.budgetVsActual.map((b) => [
        b.category,
        `INR ${b.budget.toLocaleString()}`,
        `INR ${b.actual.toLocaleString()}`,
        b.remaining < 0 ? `Over-budget: -INR ${Math.abs(b.remaining).toLocaleString()}` : `Reserve: INR ${b.remaining.toLocaleString()}`
      ]);

      doc.autoTable({
        startY: nextY + 5,
        head: catHeaders,
        body: catRows,
        theme: 'striped',
        headStyles: { fillColor: [26, 25, 23] }
      });

      addPDFFooter(doc.lastAutoTable.finalY);
      doc.save(`financial_summary_${settings.festivalYear}.pdf`);
    }
  };

  const downloadCSVReport = (type) => {
    if (type === 'collections') {
      if (!collections || collections.length === 0) {
        triggerToast('No approved collections available to export', 'info');
        return;
      }
      const headers = ['Receipt ID', 'Date', 'Donor Name', 'Phone', 'Amount (INR)', 'Payment Mode', 'Transaction Ref', 'Purpose'];
      const rows = collections.map((c) => [
        c.collectionId || '',
        c.date ? new Date(c.date).toLocaleDateString('en-IN') : '',
        (c.donorName || '').replace(/"/g, '""'),
        c.phone || '',
        c.amount || 0,
        c.paymentMode || '',
        (c.transactionRef || '').replace(/"/g, '""'),
        (c.purpose || '').replace(/"/g, '""'),
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `collections_report_${settings.festivalYear || new Date().getFullYear()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Collections CSV downloaded successfully', 'success');
    } else if (type === 'expenses') {
      if (!expenses || expenses.length === 0) {
        triggerToast('No approved expenses available to export', 'info');
        return;
      }
      const headers = ['Expense ID', 'Date', 'Category', 'Description', 'Amount (INR)', 'Paid To', 'Payment Mode', 'Bill Receipt No', 'Notes'];
      const rows = expenses.map((e) => [
        e.expenseId || '',
        e.date ? new Date(e.date).toLocaleDateString('en-IN') : '',
        e.expenseCategory || '',
        (e.description || '').replace(/"/g, '""'),
        e.amount || 0,
        (e.paidTo || '').replace(/"/g, '""'),
        e.paymentMode || '',
        (e.billReceiptNo || '').replace(/"/g, '""'),
        (e.notes || '').replace(/"/g, '""'),
      ]);
      const csv = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = `expenses_report_${settings.festivalYear || new Date().getFullYear()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('Expenses CSV downloaded successfully', 'success');
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--primary)' }}>Loading financial aggregates...</div>;
  }

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📁 Financial PDF Report System</h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate and export formatted ledger tables for committee meetings and audits.</p>
        </div>
      </div>

      <div className="grid-2">
        {/* Collection & Donations Card */}
        <div className="card card-festive-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <Wallet size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Donations Ledger Report</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Approved collections history</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Contains receipt numbers, dates, approved donor names, payment modes (UPI/Cash), transaction codes, and total amount totals.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1, minWidth: '130px' }} onClick={() => downloadPDFReport('collections')}>
              <Download size={14} /> Download PDF
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, minWidth: '130px' }} onClick={() => downloadCSVReport('collections')}>
              <FileSpreadsheet size={14} /> Download CSV
            </button>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="card card-festive-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <FileText size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Private Expenditures Ledger</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Approved committee payouts</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Lists all expenses including decorations, pujas, lightings, sound systems, payouts to vendors, and bill reference receipts.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-sm" style={{ flex: 1, minWidth: '130px', backgroundColor: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => downloadPDFReport('expenses')}>
              <Download size={14} /> Download PDF
            </button>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, minWidth: '130px' }} onClick={() => downloadCSVReport('expenses')}>
              <FileSpreadsheet size={14} /> Download CSV
            </button>
          </div>
        </div>

        {/* Budget vs Actual Card */}
        <div className="card card-festive-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(26, 25, 23, 0.1)', color: 'var(--dark)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <AlertTriangle size={24} style={{ color: 'var(--warning)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Budget vs Actual Analysis</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category target utilization</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Displays budgeted targets vs actual spends per category, displaying surpluses, deficits, and flags for categories exceeding limits.
          </p>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', backgroundColor: 'var(--warning)' }} onClick={() => downloadPDFReport('budget')}>
            <Download size={14} /> Download Budget Report PDF
          </button>
        </div>

        {/* Summary Balance Sheet Card */}
        <div className="card card-festive-border">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Financial Balance Sheet</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overall committee reserves</span>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Compiles total cash inflows, outflows, and remaining balance into a brief balance statement, with category outlines.
          </p>
          <button className="btn btn-primary btn-sm" style={{ width: '100%', backgroundColor: 'var(--success)' }} onClick={() => downloadPDFReport('summary')}>
            <Download size={14} /> Download Summary PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialReports;
