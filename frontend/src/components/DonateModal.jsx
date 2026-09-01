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

          {/* STEP 2: Dedicated QR Scanner & Verification */}
          {step === 2 && (
            <div>
              {/* Order Summary Card */}
              <div style={{ background: 'linear-gradient(135deg, hsl(38, 100%, 97%), hsl(30, 100%, 95%))', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Contributing Devotee</div>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>{donorName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Amount</div>
                  <strong style={{ fontSize: '1.35rem', color: '#D84315', fontWeight: 800 }}>₹{parsedAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Committee Payee Details with Copy UPI ID */}
              <div style={{ background: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Verified Payee ({receiverName}):</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary)', wordBreak: 'break-all' }}>{upiId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', flexShrink: 0, fontWeight: 700 }}
                  >
                    {copiedUpi ? <Check size={14} color="#2E7D32" /> : <Copy size={14} />}
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI ID'}</span>
                  </button>
                </div>
              </div>

              {/* Dedicated QR Code Scanner Showcase Card */}
              <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '2px solid hsl(38, 90%, 75%)', boxShadow: '0 4px 16px rgba(255, 102, 0, 0.08)', marginBottom: '0.85rem' }}>
                <div style={{ display: 'inline-block', position: 'relative', background: '#FFFFFF', padding: '10px', borderRadius: '16px', border: '2px solid #FFE082', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                  <img
                    src={qrCodeUrl}
                    alt="Scan & Pay UPI QR Code"
                    style={{ width: '190px', height: '190px', display: 'block', margin: '0 auto', borderRadius: '8px' }}
                  />
                </div>

                <p style={{ margin: '0.6rem 0 0.35rem', fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  Scan to Pay <span style={{ color: '#D84315', fontSize: '1.05rem', fontWeight: 900 }}>₹{parsedAmount.toLocaleString('en-IN')}</span>
                </p>

                {/* Supported Apps Strip */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', margin: '0.5rem 0 0.75rem' }}>
                  <PhonePeLogo size={24} />
                  <GooglePayLogo size={24} />
                  <PaytmLogo size={24} />
                  <UpiBhimLogo size={24} />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Supports all UPI Apps</span>
                </div>

                {/* Download / Save QR Code for scanning from phone gallery */}
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.5rem' }}
                >
                  <Download size={15} /> Save QR Code to Gallery
                </button>
              </div>

              {/* 3-Step Simple Guide */}
              <div style={{ background: 'hsl(38, 100%, 97%)', border: '1px solid hsl(38, 90%, 80%)', borderRadius: '8px', padding: '0.6rem 0.75rem', marginBottom: '0.85rem', fontSize: '0.78rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                <strong style={{ color: '#E65100', display: 'block', marginBottom: '0.2rem' }}>📌 Quick Instructions:</strong>
                1. Open PhonePe, Google Pay, Paytm, or BHIM.<br />
                2. Scan this QR Code (or upload from gallery) &amp; complete payment of ₹{parsedAmount}.<br />
                3. Enter your 12-digit UPI reference number below &amp; click <strong>"I Have Paid"</strong>.
              </div>

              {/* UTR / Reference ID & I Have Paid submission */}
              <div style={{ background: 'rgba(255, 102, 0, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(255, 102, 0, 0.25)' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                  UPI Reference / UTR Number (Optional):
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 423456789012 (12 digits)"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem', flex: '1 1 180px' }}
                  />
                  <button
                    type="button"
                    onClick={handleRecordDonation}
                    disabled={submitting}
                    className="donate-upi-btn"
                    style={{ fontSize: '0.84rem', padding: '0.5rem 1.1rem', whiteSpace: 'nowrap', flex: '1 1 auto' }}
                  >
                    {submitting ? 'Submitting...' : '✓ I Have Paid'}
                  </button>
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.35rem', display: 'block' }}>
                  Click <strong>"I Have Paid"</strong> once you complete the transfer to generate your receipt!
                </small>
              </div>

              {/* Back Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-link"
                  style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                >
                  <ArrowLeft size={14} /> Back to edit name or amount
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
