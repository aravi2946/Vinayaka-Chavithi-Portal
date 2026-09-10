import React, { useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { X, Check, Copy, QrCode, Heart, ShieldCheck, ArrowLeft, ArrowRight, User, Phone, IndianRupee, Download, Sparkles } from 'lucide-react';

const QUICK_AMOUNTS = [101, 251, 501, 1116, 2501, 5001];

// Clean brand icons for UPI apps
const PhonePeLogo = ({ size = 28 }) => (
  <img
    src="/assets/phonepe.svg"
    alt="PhonePe"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '6px', objectFit: 'contain' }}
  />
);

const GooglePayLogo = ({ size = 28 }) => (
  <img
    src="/assets/gpay.svg"
    alt="Google Pay"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '6px', objectFit: 'contain' }}
  />
);

const PaytmLogo = ({ size = 28 }) => (
  <img
    src="/assets/paytm.svg"
    alt="Paytm"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '6px', objectFit: 'contain' }}
  />
);

const UpiBhimLogo = ({ size = 28 }) => (
  <img
    src="/assets/bhim.svg"
    alt="BHIM UPI"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '6px', objectFit: 'contain' }}
  />
);

const DonateModal = ({ isOpen, onClose, onSuccess }) => {
  const { settings, triggerToast } = useAuth();

  const [step, setStep] = useState(1); // 1: Details, 2: Scan & Verify, 3: Confirmation
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showPublicly, setShowPublicly] = useState(true);
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCollection, setCreatedCollection] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  // Resolve recipient details from settings
  const receiverName = settings?.accountName || 'UPPUTURI VENKATA GANESH';
  const paymentNumber = settings?.paymentNumber || '9948050484';
  const upiId = settings?.upiId || (paymentNumber.includes('@') ? paymentNumber : `${paymentNumber}@ybl`);

  const parsedAmount = Number(amount) || 0;
  const cleanNote = 'GaneshSevaDonation';
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiverName)}&am=${parsedAmount}&cu=INR&tn=${cleanNote}`;
  const standardUpiUrl = `upi://pay?${upiParams}`;
  
  // Dynamic QR Code encoding full UPI URI with pre-filled amount and payee
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(standardUpiUrl)}`;

  const handleStep1Submit = (e) => {
    e.preventDefault();
    if (!donorName.trim()) {
      triggerToast('Please enter your full name as in payment app', 'warning');
      return;
    }
    if (!parsedAmount || parsedAmount <= 0) {
      triggerToast('Please enter a valid donation amount', 'warning');
      return;
    }
    setStep(2);
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      triggerToast(`UPI ID "${upiId}" copied to clipboard!`, 'success');
      setTimeout(() => setCopiedUpi(false), 3000);
    }
  };

  const handleDownloadQr = async () => {
    try {
      const res = await fetch(qrCodeUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Vinayaka_Seva_₹${parsedAmount}_QR.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      triggerToast('QR code saved! Open your UPI app and scan from gallery.', 'success');
    } catch (err) {
      window.open(qrCodeUrl, '_blank');
    }
  };

  const handleRecordDonation = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/collections/public-donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim(),
          amount: parsedAmount,
          phone: phone.trim(),
          paymentMode: 'UPI',
          paymentApp: 'QR Code Scanner',
          transactionRef: transactionRef.trim(),
          notes: notes.trim() ? `${notes.trim()} (via QR Scanner)` : `Online Seva Donation via QR Scanner`,
          showPublicly,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Could not record donation');
      }

      setCreatedCollection(data.collection);
      setStep(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error recording donation', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setDonorName('');
    setAmount('');
    setPhone('');
    setNotes('');
    setTransactionRef('');
    setCreatedCollection(null);
    onClose();
  };

  return (
    <div className="sponsor-modal-overlay" onClick={handleClose} role="dialog" aria-modal="true">
      <div className="donate-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="donate-modal-header">
          <button type="button" className="sponsor-modal-close-btn" onClick={handleClose} aria-label="Close Modal">
            <X size={18} />
          </button>
          
          <div style={{ fontSize: '2rem', marginBottom: '0.2rem', lineHeight: 1 }}>🙏</div>
          <h2 style={{ color: 'white', fontSize: '1.35rem', margin: 0, fontWeight: 800, letterSpacing: '0.01em' }}>
            {step === 3 ? 'Donation Submitted!' : 'Festival Seva Contribution'}
          </h2>
          <p style={{ color: '#FFF8E1', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
            {step === 1 && 'Contribute to Lord Ganesha Celebrations & Annadanam'}
            {step === 2 && 'Scan QR Code with any UPI App to Pay'}
            {step === 3 && 'Awaiting committee verification'}
          </p>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem' }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  width: step === s ? '22px' : '8px',
                  height: '6px',
                  borderRadius: '3px',
                  background: step === s ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.25s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* Modal Body */}
        <div className="donate-modal-body">
          {/* STEP 1: Enter Donor Full Name & Amount */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <div className="donate-form-group">
                <label className="donate-form-label">
                  Full Name (as in Payment App) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="donate-input-box">
                  <div className="donate-input-prefix">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    className="donate-input-control"
                    placeholder="e.g. Ramesh Kumar / Anitha Rao"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.35rem', display: 'block' }}>
                  💡 Enter your name to appear on the official donor directory.
                </small>
              </div>

              <div className="donate-form-group">
                <label className="donate-form-label">
                  Donation Amount (INR) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="donate-input-box">
                  <div className="donate-input-prefix" style={{ color: '#D84315' }}>
                    <IndianRupee size={20} strokeWidth={2.5} />
                  </div>
                  <input
                    type="number"
                    min="1"
                    className="donate-input-control donate-amount-input"
                    placeholder="Enter amount (e.g. 501)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                {/* Quick Amount Suggestion Chips */}
                <div className="donate-chips-grid">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmount(amt.toString())}
                      className={`donate-quick-chip ${parsedAmount === amt ? 'active' : ''}`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="donate-form-group">
                <label className="donate-form-label">
                  Mobile Number (Optional)
                </label>
                <div className="donate-input-box">
                  <div className="donate-input-prefix">
                    <Phone size={18} />
                  </div>
                  <input
                    type="tel"
                    className="donate-input-control"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="donate-form-group">
                <label className="donate-form-label">
                  Devotee Gotram / Seva Wish (Optional)
                </label>
                <div className="donate-input-box">
                  <div className="donate-input-prefix">
                    <Heart size={18} />
                  </div>
                  <input
                    type="text"
                    className="donate-input-control"
                    placeholder="e.g. For Family Health & Blessings"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', background: 'rgba(255, 102, 0, 0.07)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(255, 102, 0, 0.25)' }}>
                <input
                  type="checkbox"
                  id="showPublicly"
                  checked={showPublicly}
                  onChange={(e) => setShowPublicly(e.target.checked)}
                  style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <label htmlFor="showPublicly" style={{ fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer', margin: 0, fontWeight: 500 }}>
                  Show my name on the public donor honor roll after approval
                </label>
              </div>

              <button
                type="submit"
                className="donate-upi-btn"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.02rem', fontWeight: 800 }}
              >
                <span>Continue to QR Scanner</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* STEP 2: Dedicated QR Scanner & Verification (Compact & Space-Optimized) */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Order & Payee Combined Card */}
              <div style={{ background: 'linear-gradient(135deg, hsl(38, 100%, 97%), hsl(30, 100%, 95%))', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: '12px', padding: '0.6rem 0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', borderBottom: '1px dashed rgba(0,0,0,0.1)', paddingBottom: '0.35rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Contributing Devotee:</span>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{donorName}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Amount:</span>
                    <div style={{ fontSize: '1.25rem', color: '#D84315', fontWeight: 900, lineHeight: 1.1 }}>₹{parsedAmount.toLocaleString('en-IN')}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Payee ({receiverName}): </span>
                    <strong style={{ color: 'var(--primary)' }}>{upiId}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.55rem', fontWeight: 700 }}
                  >
                    {copiedUpi ? <Check size={12} color="#2E7D32" /> : <Copy size={12} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy UPI'}</span>
                  </button>
                </div>
              </div>

              {/* Dedicated QR Code Scanner Card */}
              <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '0.75rem', borderRadius: '12px', border: '1.5px solid hsl(38, 90%, 75%)', boxShadow: '0 2px 10px rgba(255, 102, 0, 0.06)' }}>
                <div style={{ display: 'inline-block', background: '#FFFFFF', padding: '6px', borderRadius: '12px', border: '1.5px solid #FFE082', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <img
                    src={qrCodeUrl}
                    alt="Scan & Pay UPI QR Code"
                    style={{ width: '165px', height: '165px', display: 'block', margin: '0 auto', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ margin: '0.4rem 0 0.2rem', fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Scan to Pay <span style={{ color: '#D84315', fontSize: '0.98rem', fontWeight: 900 }}>₹{parsedAmount.toLocaleString('en-IN')}</span>
                </div>

                {/* Supported Apps Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', margin: '0.3rem 0 0.45rem' }}>
                  <PhonePeLogo size={20} />
                  <GooglePayLogo size={20} />
                  <PaytmLogo size={20} />
                  <UpiBhimLogo size={20} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>All UPI Apps</span>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.78rem', padding: '0.35rem 0.5rem' }}
                >
                  <Download size={13} /> Save QR Code
                </button>
              </div>

              {/* UTR / Reference ID & Submission */}
              <div style={{ background: 'rgba(255, 102, 0, 0.05)', padding: '0.65rem 0.8rem', borderRadius: '10px', border: '1px solid rgba(255, 102, 0, 0.2)' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.3rem' }}>
                  UPI Reference / UTR Number:
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="12-digit UTR (Optional)"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem', flex: '1 1 150px', height: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={handleRecordDonation}
                    disabled={submitting}
                    className="donate-upi-btn"
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.95rem', height: '36px', whiteSpace: 'nowrap', flex: '1 1 auto' }}
                  >
                    {submitting ? 'Submitting...' : '✓ I Have Paid'}
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-link"
                  style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                >
                  <ArrowLeft size={13} /> Back to edit details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation Status */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4CAF50, #2E7D32)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 4px 16px rgba(46, 125, 50, 0.35)' }}>
                <Check size={36} strokeWidth={3} />
              </div>

              <h3 style={{ fontSize: '1.3rem', color: 'var(--primary)', fontWeight: 800, margin: '0 0 0.4rem' }}>
                🌺 Thank You, {donorName}! 🌺
              </h3>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-main)', margin: '0 0 1rem' }}>
                Your seva contribution of <strong style={{ color: 'var(--success)', fontSize: '1.1rem' }}>₹{parsedAmount.toLocaleString('en-IN')}</strong> has been submitted.
              </p>

              {createdCollection?.collectionId && (
                <div style={{ display: 'inline-block', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '0.35rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Reference Receipt ID: <strong style={{ color: 'var(--primary)' }}>{createdCollection.collectionId}</strong>
                </div>
              )}

              <div style={{ background: 'hsl(38, 100%, 97%)', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'left', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#E65100', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={16} /> Committee Verification Protocol
                </div>
                <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.5, fontSize: '0.82rem' }}>
                  Your donation is recorded with status <strong style={{ color: '#E65100' }}>Pending Approval</strong>. The festival committee will verify the transaction against bank statements and approve your entry on the public donor honor roll!
                </p>
              </div>

              <button
                type="button"
                className="donate-upi-btn"
                onClick={handleClose}
                style={{ width: '100%', padding: '0.8rem', fontWeight: 800 }}
              >
                🙏 Done / Haro Hara
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonateModal;
