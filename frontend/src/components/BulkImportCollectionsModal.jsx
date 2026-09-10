import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { X, Upload, Check, AlertTriangle, Trash2, FileSpreadsheet, Edit3, ArrowRight } from 'lucide-react';
import { API_URL, useAuth } from '../context/AuthContext';

const BulkImportCollectionsModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, triggerToast } = useAuth();
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [importing, setImporting] = useState(false);
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview & Edit

  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to match column headers loosely
  const findColumnValue = (row, ...keys) => {
    const rowKeys = Object.keys(row);
    for (const key of keys) {
      const found = rowKeys.find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '').includes(key.toLowerCase().replace(/[^a-z0-9]/g, '')));
      if (found && row[found] !== undefined && row[found] !== null && String(row[found]).trim() !== '') {
        return row[found];
      }
    }
    return '';
  };

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setFileName(uploadedFile.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          triggerToast('Uploaded sheet appears to be empty', 'warning');
          return;
        }

        // Map columns with smart heuristics
        const parsedRows = json.map((r, idx) => {
          // Date mapping
          let rawDate = findColumnValue(r, 'date', 'donationdate', 'paymentdate', 'day');
          let parsedDate = todayStr;
          if (rawDate) {
            if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
              parsedDate = rawDate.toISOString().split('T')[0];
            } else {
              const d = new Date(rawDate);
              if (!isNaN(d.getTime())) {
                parsedDate = d.toISOString().split('T')[0];
              }
            }
          }

          // Donor Name mapping
          const donorName = String(findColumnValue(r, 'donorname', 'name', 'donor', 'devotee', 'contributor', 'fullname')).trim();

          // Amount mapping
          const rawAmount = findColumnValue(r, 'amount', 'amt', 'rupees', 'rs', 'sum', 'total', 'donation');
          const cleanAmountStr = String(rawAmount).replace(/[^0-9.]/g, '');
          const parsedAmount = Number(cleanAmountStr) || 0;

          // Payment mode mapping
          const rawMode = String(findColumnValue(r, 'paymentmode', 'paymenttype', 'mode', 'method', 'type')).trim().toLowerCase();
          let paymentMode = 'Cash';
          if (rawMode.includes('upi') || rawMode.includes('gpay') || rawMode.includes('phonepe') || rawMode.includes('paytm') || rawMode.includes('bhim')) {
            paymentMode = 'UPI';
          } else if (rawMode.includes('bank') || rawMode.includes('neft') || rawMode.includes('rtgs') || rawMode.includes('transfer') || rawMode.includes('cheque')) {
            paymentMode = 'Bank Transfer';
          } else if (rawMode.includes('other')) {
            paymentMode = 'Other';
          }

          // Phone & other optional
          const phone = String(findColumnValue(r, 'phone', 'mobile', 'contact')).trim();
          const transactionRef = String(findColumnValue(r, 'transactionref', 'ref', 'utr', 'transactionid', 'txnid')).trim();
          const purpose = String(findColumnValue(r, 'purpose', 'seva', 'category', 'reason')).trim() || 'Festival Donation';
          const notes = String(findColumnValue(r, 'notes', 'remarks', 'comment')).trim();

          return {
            id: idx + 1,
            date: parsedDate,
            donorName,
            amount: parsedAmount > 0 ? parsedAmount : '',
            paymentMode,
            phone,
            transactionRef,
            purpose,
            notes,
            showPublicly: true,
          };
        });

        setRows(parsedRows);
        setStep(2);
      } catch (err) {
        console.error(err);
        triggerToast('Error reading Excel/CSV file: ' + err.message, 'danger');
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value };
        }
        return r;
      })
    );
  };

  const handleDeleteRow = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Validation
  const validRows = rows.filter((r) => r.donorName.trim().length > 0 && Number(r.amount) > 0);
  const totalAmount = validRows.reduce((sum, r) => sum + Number(r.amount), 0);

  const handleCommitImport = async () => {
    if (validRows.length === 0) {
      triggerToast('No valid rows to import. Each row must have a Donor Name and Amount > 0.', 'warning');
      return;
    }

    setImporting(true);
    try {
      const token = user?.token;
      const res = await fetch(`${API_URL}/collections/bulk-import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          records: validRows,
          defaultStatus: 'Approved',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to import collections');
      }

      triggerToast(`🎉 Successfully imported ${data.count} donation records!`, 'success');
      if (onSuccess) onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error during import', 'danger');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setFileName('');
    setRows([]);
    setStep(1);
    onClose();
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        'Date': todayStr,
        'Donor Name': 'Upputuri Venkata Ganesh',
        'Amount': 5001,
        'Payment Mode': 'UPI',
        'Phone': '9948050484',
        'Transaction Ref': 'UPI4920192831',
        'Purpose': 'Annadanam Donation',
        'Notes': 'Sample Seva',
      },
      {
        'Date': todayStr,
        'Donor Name': 'K. Ramachandra',
        'Amount': 2500,
        'Payment Mode': 'Cash',
        'Phone': '9845011111',
        'Transaction Ref': '',
        'Purpose': 'Puja Materials',
        'Notes': 'Cash direct',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CollectionsTemplate');
    XLSX.writeFile(wb, 'collections_import_template.xlsx');
  };

  return (
    <div className="sponsor-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div
        className="sponsor-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', width: '96%', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="sponsor-modal-header" style={{ background: 'linear-gradient(135deg, #E65100, #FF8F00)' }}>
          <button type="button" className="sponsor-modal-close-btn" onClick={handleClose} aria-label="Close">
            <X size={18} />
          </button>
          <div style={{ fontSize: '2.4rem', marginBottom: '0.2rem' }}>📊</div>
          <h2 style={{ color: 'white', fontSize: '1.4rem', margin: 0, fontWeight: 800 }}>
            Bulk Import Collections
          </h2>
          <p style={{ color: '#FFE082', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
            Upload Excel (.xlsx, .xls) or CSV files with auto-filled date, name, and amount
          </p>
        </div>

        {/* Body */}
        <div className="sponsor-modal-body" style={{ padding: '1.5rem' }}>
          {step === 1 && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div
                style={{
                  border: '2px dashed #FF9800',
                  borderRadius: '16px',
                  background: 'hsl(38, 100%, 98%)',
                  padding: '2.5rem 1.5rem',
                  cursor: 'pointer',
                  position: 'relative',
                  marginBottom: '1.25rem',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="file"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <div style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>
                  <FileSpreadsheet size={48} style={{ margin: '0 auto' }} />
                </div>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: '0 0 0.35rem', fontWeight: 800 }}>
                  Click to select or drag & drop Excel / CSV file
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Supports .xlsx, .xls, and .csv formats
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={downloadSampleTemplate}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
                >
                  <FileSpreadsheet size={15} /> Download Sample Excel Template
                </button>
              </div>

              <div style={{ marginTop: '1.5rem', textAlign: 'left', background: 'hsl(30, 20%, 96%)', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.35rem' }}>💡 Smart Column Mapping Rules:</strong>
                • <strong>Date:</strong> Auto-detected from columns like Date or Day. Missing date automatically defaults to today's import date ({todayStr}).<br />
                • <strong>Donor Name &amp; Amount:</strong> Mandatory for import. Strips currency symbols (₹, Rs, commas) automatically.<br />
                • <strong>Payment Mode:</strong> Detects Cash, UPI, or Bank Transfer. Defaults to Cash.<br />
                • <strong>Preview &amp; Edit:</strong> You will review, validate, and can directly edit any row before confirming import.
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              {/* Summary strip */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'hsl(38, 100%, 97%)', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded File:</div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{fileName}</strong>
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Total Rows</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{rows.length}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Valid Records</span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{validRows.length}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Total Collection</span>
                    <strong style={{ fontSize: '1.25rem', color: '#D84315', fontWeight: 800 }}>₹{totalAmount.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Instructions badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                <Edit3 size={14} style={{ color: 'var(--primary)' }} />
                <span>You can directly click and edit any cell below before importing. Missing names or amounts are highlighted in red.</span>
              </div>

              {/* Editable Table */}
              <div style={{ overflowX: 'auto', maxHeight: '48vh', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                <table className="data-table" style={{ fontSize: '0.82rem', margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--bg-secondary)' }}>
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th style={{ minWidth: '130px' }}>Date</th>
                      <th style={{ minWidth: '180px' }}>Donor Name *</th>
                      <th style={{ minWidth: '110px' }}>Amount (₹) *</th>
                      <th style={{ minWidth: '130px' }}>Payment Mode</th>
                      <th style={{ minWidth: '120px' }}>Phone</th>
                      <th style={{ minWidth: '130px' }}>Transaction Ref</th>
                      <th style={{ minWidth: '140px' }}>Purpose</th>
                      <th style={{ width: '40px', textAlign: 'center' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const isNameValid = row.donorName.trim().length > 0;
                      const isAmountValid = Number(row.amount) > 0;
                      const isRowValid = isNameValid && isAmountValid;

                      return (
                        <tr key={row.id} style={{ background: isRowValid ? 'transparent' : 'rgba(255, 0, 0, 0.04)' }}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{index + 1}</td>
                          <td>
                            <input
                              type="date"
                              className="form-control"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', height: '32px' }}
                              value={row.date}
                              onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{
                                padding: '0.25rem 0.45rem',
                                fontSize: '0.8rem',
                                height: '32px',
                                borderColor: isNameValid ? 'var(--border-color)' : 'var(--danger)',
                                background: isNameValid ? '#FFFFFF' : '#FFEBEE',
                              }}
                              placeholder="Required donor name"
                              value={row.donorName}
                              onChange={(e) => handleRowChange(row.id, 'donorName', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              className="form-control"
                              style={{
                                padding: '0.25rem 0.45rem',
                                fontSize: '0.8rem',
                                height: '32px',
                                borderColor: isAmountValid ? 'var(--border-color)' : 'var(--danger)',
                                background: isAmountValid ? '#FFFFFF' : '#FFEBEE',
                                fontWeight: 700,
                              }}
                              placeholder="Amount"
                              value={row.amount}
                              onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="form-control"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', height: '32px' }}
                              value={row.paymentMode}
                              onChange={(e) => handleRowChange(row.id, 'paymentMode', e.target.value)}
                            >
                              <option value="Cash">Cash</option>
                              <option value="UPI">UPI</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', height: '32px' }}
                              placeholder="Optional"
                              value={row.phone}
                              onChange={(e) => handleRowChange(row.id, 'phone', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', height: '32px' }}
                              placeholder="Optional Ref"
                              value={row.transactionRef}
                              onChange={(e) => handleRowChange(row.id, 'transactionRef', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              style={{ padding: '0.25rem 0.45rem', fontSize: '0.8rem', height: '32px' }}
                              value={row.purpose}
                              onChange={(e) => handleRowChange(row.id, 'purpose', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(row.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.4rem', color: 'var(--danger)' }}
                              title="Remove row"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary btn-sm"
                >
                  Upload Different File
                </button>

                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-secondary btn-sm"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCommitImport}
                    disabled={importing || validRows.length === 0}
                    className="btn btn-primary"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}
                  >
                    {importing ? (
                      'Importing...'
                    ) : (
                      <>
                        <Check size={16} /> Verify &amp; Import ({validRows.length} Collections)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkImportCollectionsModal;
