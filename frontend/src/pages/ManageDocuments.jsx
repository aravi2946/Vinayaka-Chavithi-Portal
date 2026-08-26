import React, { useState, useEffect } from 'react';
import { useAuth, API_URL, getMediaUrl } from '../context/AuthContext';
import { Plus, Edit2, Trash2, X, FileText, Globe, Lock, Calendar } from 'lucide-react';

const ManageDocuments = () => {
  const { user, triggerToast } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [form, setForm] = useState({
    documentName: '',
    fileUrl: '',
    visibility: 'Committee Only',
    documentType: 'Rules',
    date: new Date().toISOString().substring(0, 10),
  });

  const docTypes = ['Schedule', 'Rules', 'Public Notice', 'Financial Report', 'Permission', 'Meeting Minutes', 'Other'];

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      triggerToast('Error loading documents', 'danger');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Safety check: Financial documents must default and lock to "Committee Only"
    if (name === 'documentType' && value === 'Financial Report') {
      setForm((prev) => ({
        ...prev,
        [name]: value,
        visibility: 'Committee Only',
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setUploadMode('url');
    setUploadingDoc(false);
    setForm({
      documentName: '',
      fileUrl: '',
      visibility: 'Committee Only',
      documentType: 'Rules',
      date: new Date().toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setEditingId(doc._id);
    setUploadMode(doc.fileUrl && doc.fileUrl.startsWith('/uploads') ? 'file' : 'url');
    setUploadingDoc(false);
    setForm({
      documentName: doc.documentName,
      fileUrl: doc.fileUrl,
      visibility: doc.visibility,
      documentType: doc.documentType,
      date: new Date(doc.date).toISOString().substring(0, 10),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingDoc(true);
    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setForm((prev) => ({
        ...prev,
        fileUrl: data.fileUrl
      }));
      triggerToast('Document uploaded successfully!', 'success');
    } catch (error) {
      console.error(error);
      triggerToast(error.message, 'danger');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.documentName || !form.fileUrl) {
      triggerToast('Please fill out document name and URL link', 'warning');
      return;
    }

    try {
      const token = user.token;
      const url = editingId ? `${API_URL}/documents/${editingId}` : `${API_URL}/documents`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Operation failed');
      }

      triggerToast(editingId ? 'Document details updated!' : 'Document registered successfully!', 'success');
      setModalOpen(false);
      fetchDocuments();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this document reference?')) {
      return;
    }

    try {
      const token = user.token;
      const res = await fetch(`${API_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Delete failed');
      }

      triggerToast('Document deleted successfully', 'info');
      fetchDocuments();
    } catch (error) {
      triggerToast(error.message, 'danger');
    }
  };

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>📁 Document & Permission Repository</h1>
          <p style={{ color: 'var(--text-muted)' }}>Upload guidelines, public forms, or confidential NOC permissions and meeting minutes.</p>
        </div>
        <div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
            <Plus size={16} /> Upload Document
          </button>
        </div>
      </div>

      {/* Document List View */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--primary)' }}>Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No documents registered yet.</p>
        </div>
      ) : (
        <div className="grid-2">
          {documents.map((doc) => (
            <div key={doc._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={24} />
                </div>
                <div style={{ minWidth: 0, flexGrow: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={doc.documentName}>
                      {doc.documentName}
                    </h2>
                    <span className={`badge ${doc.visibility === 'Public' ? 'badge-approved' : 'badge-draft'}`} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      {doc.visibility === 'Public' ? <Globe size={10} /> : <Lock size={10} />}
                      {doc.visibility}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <span>Type: <strong>{doc.documentType}</strong></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Calendar size={12} />
                      {new Date(doc.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span>By: {doc.addedBy}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <a href={getMediaUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                  View Document
                </a>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button onClick={() => handleOpenEdit(doc)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem' }}>
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(doc._id)} className="btn btn-danger btn-sm" style={{ padding: '0.25rem' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
                {editingId ? '📝 Edit Document Details' : '📁 Upload Document'}
              </h2>
              <button className="btn btn-link" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="documentName">Document Name *</label>
                  <input
                    type="text"
                    id="documentName"
                    name="documentName"
                    className="form-control"
                    placeholder="E.g. Police Pandal Permission NOC"
                    value={form.documentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Document File Source *</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${uploadMode === 'url' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUploadMode('url')}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Link URL
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${uploadMode === 'file' ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setUploadMode('file')}
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      Upload File
                    </button>
                  </div>

                  {uploadMode === 'url' ? (
                    <div>
                      <input
                        type="url"
                        id="fileUrl"
                        name="fileUrl"
                        className="form-control"
                        placeholder="E.g. https://www.drive.google.com/..."
                        value={form.fileUrl}
                        onChange={handleInputChange}
                        required
                      />
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Paste a link to Google Drive, Dropbox, or a public document URL.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                        className="form-control"
                        onChange={handleFileUpload}
                        disabled={uploadingDoc}
                      />
                      {uploadingDoc && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span className="spinner" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Uploading document to server...
                        </div>
                      )}
                      {form.fileUrl && !uploadingDoc && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span>✓ File set:</span>
                          <span style={{ wordBreak: 'break-all', fontWeight: 600 }}>{form.fileUrl}</span>
                        </div>
                      )}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Select a PDF, Word, Excel, or text document file from your device.
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label htmlFor="documentType">Document Type *</label>
                    <select
                      id="documentType"
                      name="documentType"
                      className="form-control"
                      value={form.documentType}
                      onChange={handleInputChange}
                      required
                    >
                      {docTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="visibility">Visibility Privacy *</label>
                    <select
                      id="visibility"
                      name="visibility"
                      className="form-control"
                      value={form.visibility}
                      onChange={handleInputChange}
                      disabled={form.documentType === 'Financial Report'}
                      required
                    >
                      <option value="Committee Only">🔒 Committee Only</option>
                      <option value="Public">🌐 Public Download</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Upload Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      className="form-control"
                      value={form.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {form.documentType === 'Financial Report' && (
                  <div style={{ background: 'rgba(255, 0, 0, 0.03)', color: 'var(--danger)', border: '1px dashed var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    ℹ️ <strong>Strict Security Constraint</strong>: Financial documents are restricted to "Committee Only" and cannot be published to the public portal.
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editingId ? 'Save Changes' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;
