import React, { useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { X, Check, Copy, ExternalLink, QrCode, Smartphone, Sparkles, Heart, ShieldCheck, ArrowLeft, ArrowRight, User, Phone, IndianRupee, Download, Info } from 'lucide-react';

const QUICK_AMOUNTS = [101, 251, 501, 1116, 2501, 5001];

// Realistic Official Brand Logos from SVG Assets
const PhonePeLogo = ({ size = 40 }) => (
  <img
    src="/assets/phonepe.svg"
    alt="PhonePe Logo"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(95,37,159,0.3)' }}
  />
);

const GooglePayLogo = ({ size = 40 }) => (
  <img
    src="/assets/gpay.svg"
    alt="Google Pay Logo"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '10px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))' }}
  />
);

const PaytmLogo = ({ size = 40 }) => (
  <img
    src="/assets/paytm.svg"
    alt="Paytm Logo"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,41,112,0.25)' }}
  />
);

const UpiBhimLogo = ({ size = 40 }) => (
  <img
    src="/assets/bhim.svg"
    alt="BHIM UPI Logo"
    width={size}
    height={size}
    style={{ flexShrink: 0, borderRadius: '10px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))' }}
  />
);

const DonateModal = ({ isOpen, onClose, onSuccess }) => {
  const { settings, triggerToast } = useAuth();

  const [step, setStep] = useState(1); // 1: Details, 2: Select Mode & Pay, 3: Confirmation
  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'apps'
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showPublicly, setShowPublicly] = useState(true);
  const [selectedApp, setSelectedApp] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCollection, setCreatedCollection] = useState(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [appLaunched, setAppLaunched] = useState(false);

  if (!isOpen) return null;

  // Resolve recipient details from settings
  const receiverName = settings?.accountName || 'UPPUTURI VENKATA GANESH';
  const paymentNumber = settings?.paymentNumber || '9948050484';
  const upiId = settings?.upiId || (paymentNumber.includes('@') ? paymentNumber : `${paymentNumber}@ybl`);

  // Construct standard universal UPI intent link
  const parsedAmount = Number(amount) || 0;
  // Clean alphanumeric note to prevent NPCI URI decode drops
  const cleanNote = 'GaneshSevaDonation';
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiverName)}&am=${parsedAmount}&cu=INR&tn=${cleanNote}`;
  
  // Universal standard UPI URL (most reliable across Android / iOS)
  const standardUpiUrl = `upi://pay?${upiParams}`;
  
  // Dynamic QR Code encoding full UPI URI with pre-filled amount and payee
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(standardUpiUrl)}`;

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
      triggerToast('QR code saved! Open PhonePe/GPay -> Scan from Gallery to pay.', 'success');
    } catch (err) {
      window.open(qrCodeUrl, '_blank');
    }
  };

  const handleAppPayClick = (appName) => {
    setSelectedApp(appName);
    setAppLaunched(true);

    // 1. Copy UPI ID immediately to clipboard for 100% reliable manual paste fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 3000);
    }

    // 2. Trigger standard UPI intent
    try {
      window.location.href = standardUpiUrl;
    } catch (err) {
      console.warn('Intent launch failed:', err);
    }

    triggerToast(`UPI ID copied! Opening ${appName}...`, 'info');
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
          paymentApp: selectedApp || (activeTab === 'qr' ? 'QR Code' : 'UPI Transfer'),
          transactionRef: transactionRef.trim(),
          notes: notes.trim() ? `${notes.trim()} (via ${selectedApp || 'UPI'})` : `Online Seva Donation via ${selectedApp || 'UPI'}`,
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
    setActiveTab('qr');
    setDonorName('');
    setAmount('');
    setPhone('');
    setNotes('');
    setSelectedApp('');
    setTransactionRef('');
    setAppLaunched(false);
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
            {step === 3 ? 'Donation Submitted!' : 'Online Festival Seva (UPI)'}
          </h2>
          <p style={{ color: '#FFF8E1', fontSize: '0.82rem', margin: '0.25rem 0 0' }}>
            {step === 1 && 'Contribute to Lord Ganesha Celebrations & Annadanam'}
            {step === 2 && 'Scan QR Code or Pay via UPI App'}
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
                  💡 Enter the name shown in your payment app for instant verification.
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
                <span>Continue to Payment</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}

          {/* STEP 2: Select Payment Method (QR Code or 1-Tap App) */}
          {step === 2 && (
            <div>
              {/* Order Summary Badge */}
              <div style={{ background: 'linear-gradient(135deg, hsl(38, 100%, 97%), hsl(30, 100%, 95%))', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-md)', padding: '0.8rem 1rem', marginBottom: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Contributing Devotee</div>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>{donorName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Amount</div>
                  <strong style={{ fontSize: '1.35rem', color: '#D84315', fontWeight: 800 }}>₹{parsedAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Committee UPI ID Info Banner with 1-Click Copy */}
              <div style={{ background: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Receiver ({receiverName}):</div>
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

              {/* Method Switcher Tabs */}
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('qr')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.6rem',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    background: activeTab === 'qr' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'qr' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <QrCode size={16} />
                  <span>Scan QR Code (100% Works)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('apps')}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.6rem',
                    border: 'none',
                    borderRadius: 'var(--radius-full)',
                    background: activeTab === 'apps' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'apps' ? '#FFFFFF' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.25s ease',
                  }}
                >
                  <Smartphone size={16} />
                  <span>Pay via UPI App</span>
                </button>
              </div>

              {/* TAB 1: DYNAMIC QR CODE (Guaranteed Working on All Banks) */}
              {activeTab === 'qr' && (
                <div style={{ textAlign: 'center', background: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid hsl(38, 90%, 75%)', boxShadow: '0 4px 14px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
                  <div style={{ display: 'inline-block', position: 'relative', background: '#ffffff', padding: '8px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      style={{ width: '185px', height: '185px', display: 'block', margin: '0 auto' }}
                    />
                  </div>

                  <p style={{ margin: '0.5rem 0 0.25rem', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Scan with PhonePe, GPay, Paytm, or BHIM to pay <strong style={{ color: '#D84315', fontSize: '0.95rem' }}>₹{parsedAmount}</strong>
                  </p>

                  {/* Mobile Tip: Save QR / Scan from Gallery */}
                  <div style={{ background: 'hsl(38, 100%, 97%)', border: '1px solid hsl(38, 90%, 80%)', borderRadius: '8px', padding: '0.5rem 0.75rem', margin: '0.6rem 0', textAlign: 'left', fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <strong style={{ color: '#E65100' }}>💡 Paying on this same phone?</strong>
                    <br />
                    1. Tap <strong>"Save QR Code"</strong> below.
                    <br />
                    2. Open <strong>PhonePe / GPay</strong> ➔ Tap <strong>QR Scanner</strong> ➔ Select <strong>"Upload / Scan from Gallery"</strong>.
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                    <button
                      type="button"
                      onClick={handleDownloadQr}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.55rem' }}
                    >
                      <Download size={15} /> Save QR Code
                    </button>

                    <a
                      href={standardUpiUrl}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', fontSize: '0.8rem', padding: '0.55rem', textDecoration: 'none' }}
                    >
                      <ExternalLink size={15} /> Open UPI App
                    </a>
                  </div>
                </div>
              )}

              {/* TAB 2: UPI APPS (Intent + 1-Tap Copy VPA) */}
              {activeTab === 'apps' && (
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                    Tap your UPI app below (copies UPI ID automatically & opens app):
                  </div>

                  <div className="donate-apps-grid">
                    {/* PhonePe */}
                    <button
                      type="button"
                      onClick={() => handleAppPayClick('PhonePe')}
                      className="donate-app-card phonepe"
                    >
                      <PhonePeLogo size={38} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#5F259F', lineHeight: 1.2 }}>PhonePe</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Tap to Pay ₹{parsedAmount}</span>
                      </div>
                    </button>

                    {/* Google Pay */}
                    <button
                      type="button"
                      onClick={() => handleAppPayClick('Google Pay')}
                      className="donate-app-card gpay"
                    >
                      <GooglePayLogo size={38} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A73E8', lineHeight: 1.2 }}>Google Pay</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Tap to Pay ₹{parsedAmount}</span>
                      </div>
                    </button>

                    {/* Paytm */}
                    <button
                      type="button"
                      onClick={() => handleAppPayClick('Paytm')}
                      className="donate-app-card paytm"
                    >
                      <PaytmLogo size={38} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#002970', lineHeight: 1.2 }}>Paytm</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>Wallet / UPI</span>
                      </div>
                    </button>

                    {/* Any UPI / BHIM */}
                    <button
                      type="button"
                      onClick={() => handleAppPayClick('BHIM / Other UPI')}
                      className="donate-app-card bhim"
                    >
                      <UpiBhimLogo size={38} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#E65100', lineHeight: 1.2 }}>Other UPI</div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>BHIM / Cred</span>
                      </div>
                    </button>
                  </div>

                  {/* Assistive Info on NPCI Web-Intent Restrictions */}
                  <div style={{ background: '#F5F5F5', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.8rem', fontSize: '0.76rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '0.85rem' }}>
                    <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                      <Info size={14} color="var(--primary)" /> Note on Direct App Links:
                    </div>
                    If your bank app displays <em>"Web link payment not allowed"</em> (due to NPCI P2P safety rules), simply open your app, tap <strong>"To UPI ID"</strong>, paste <strong>{upiId}</strong>, and enter ₹{parsedAmount}.
                  </div>
                </div>
              )}

              {/* UTR / Confirmation Section */}
              <div style={{ background: 'rgba(255, 102, 0, 0.05)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid rgba(255, 102, 0, 0.25)', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: '0.35rem' }}>
                  UPI Reference / UTR Number (Optional):
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 423456789012 (12 digits)"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.65rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleRecordDonation}
                    disabled={submitting}
                    className="donate-upi-btn"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 1rem', whiteSpace: 'nowrap' }}
                  >
                    {submitting ? 'Submitting...' : 'I Have Paid'}
                  </button>
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.3rem', display: 'block' }}>
                  Click <strong>"I Have Paid"</strong> once you complete the transfer to generate your receipt!
                </small>
              </div>

              {/* Back Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-link"
                  style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                >
                  <ArrowLeft size={14} /> Edit name or amount
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation / Pending Status */}
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
                  Your donation is recorded with status <strong style={{ color: '#E65100' }}>Pending Approval</strong>. The festival treasurer will verify the UPI receipt against bank statements and approve your record to appear on the public donor honor roll!
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
