import React, { useState } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { X, Check, Copy, ExternalLink, QrCode, Smartphone, Sparkles, Heart, ShieldCheck, ArrowLeft, ArrowRight, User, Phone, IndianRupee, MessageSquareQuote } from 'lucide-react';

const QUICK_AMOUNTS = [101, 251, 501, 1116, 2501, 5001];

// Realistic Brand SVG Logos
const PhonePeLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '8px' }}>
    <rect width="512" height="512" rx="112" fill="#5F259F" />
    <path d="M344 140H198c-8.8 0-16 7.2-16 16v216c0 6.6 5.4 12 12 12h44c6.6 0 12-5.4 12-12v-84h94c64 0 106-40 106-94s-42-94-106-94zm-2 124h-92v-60h92c30 0 46 13 46 30s-16 30-46 30z" fill="#FFFFFF" />
    <path d="M250 288l132 132c4.7 4.7 12.3 4.7 17 0l22-22c4.7-4.7 4.7-12.3 0-17L289 249" fill="#FFFFFF" />
  </svg>
);

const GooglePayLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '8px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
    <rect width="48" height="48" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M35.6 24.3c0-.8-.1-1.6-.2-2.3H24v4.5h6.5c-.3 1.5-1.2 2.8-2.5 3.7v3.1h4c2.4-2.2 3.6-5.4 3.6-9z" fill="#4285F4"/>
    <path d="M24 36c3.3 0 6-1.1 8-3l-4-3.1c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H13.2v3.2C15.3 33.5 19.3 36 24 36z" fill="#34A853"/>
    <path d="M17.4 26.2c-.2-.7-.4-1.5-.4-2.2s.2-1.5.4-2.2v-3.2h-4.2C12.4 20.2 12 22 12 24s.4 3.8 1.2 5.4l4.2-3.2z" fill="#FBBC05"/>
    <path d="M24 16.8c1.8 0 3.4.6 4.7 1.8l3.5-3.5C30 13.1 27.2 12 24 12c-4.7 0-8.7 2.5-10.8 6.6l4.2 3.2c.9-2.8 3.5-4.9 6.6-4.9z" fill="#EA4335"/>
  </svg>
);

const PaytmLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '8px', filter: 'drop-shadow(0 1px 2px rgba(0,41,112,0.15))' }}>
    <rect width="54" height="54" rx="12" fill="#002970" />
    <text x="50%" y="42%" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">Pay</text>
    <text x="50%" y="78%" textAnchor="middle" fill="#00BAF2" fontSize="15" fontWeight="900" fontFamily="sans-serif">tm</text>
  </svg>
);

const UpiBhimLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0, borderRadius: '8px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>
    <rect width="48" height="48" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
    <path d="M19 12L12 36H19L26 12H19Z" fill="#097939" />
    <path d="M31 12L24 36H31L38 12H31Z" fill="#ED752E" />
    <path d="M25 12L23 21L29 21L25 12Z" fill="#1A202C" opacity="0.25" />
  </svg>
);

const DonateModal = ({ isOpen, onClose, onSuccess }) => {
  const { settings, triggerToast } = useAuth();

  const [step, setStep] = useState(1); // 1: Details, 2: Select App & Pay, 3: Confirmation
  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [showPublicly, setShowPublicly] = useState(true);
  const [selectedApp, setSelectedApp] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCollection, setCreatedCollection] = useState(null);
  const [showQr, setShowQr] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  if (!isOpen) return null;

  // Resolve recipient details from settings
  const receiverName = settings?.accountName || 'UPPUTURI VENKATA GANESH';
  const paymentNumber = settings?.paymentNumber || '9948050484';
  const upiId = settings?.upiId || (paymentNumber.includes('@') ? paymentNumber : `${paymentNumber}@ybl`);

  // Construct standard UPI links
  const parsedAmount = Number(amount) || 0;
  const noteText = `Donation by ${donorName || 'Devotee'}`;
  const upiParams = `pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(receiverName)}&am=${parsedAmount}&cu=INR&tn=${encodeURIComponent(noteText)}`;
  
  const standardUpiUrl = `upi://pay?${upiParams}`;
  const gpayUrl = `tez://upi/pay?${upiParams}`;
  const phonepeUrl = `phonepe://pay?${upiParams}`;
  const paytmUrl = `paytmmp://pay?${upiParams}`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(standardUpiUrl)}`;

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

  const handleRecordDonation = async (appName, directUrl = null) => {
    if (submitting) return;
    setSubmitting(true);
    setSelectedApp(appName);

    try {
      const res = await fetch(`${API_URL}/collections/public-donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: donorName.trim(),
          amount: parsedAmount,
          phone: phone.trim(),
          paymentMode: 'UPI',
          paymentApp: appName,
          transactionRef: transactionRef.trim(),
          notes: notes.trim() ? `${notes.trim()} (via ${appName})` : `Online Seva Donation via ${appName}`,
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

      // Launch UPI app if URL provided (on mobile devices)
      if (directUrl) {
        window.location.href = directUrl;
      }
    } catch (err) {
      console.error(err);
      triggerToast(err.message || 'Error initiating donation', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      triggerToast(`UPI ID "${upiId}" copied!`, 'success');
      setTimeout(() => setCopiedUpi(false), 3000);
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
    setShowQr(false);
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
            {step === 2 && 'Select your UPI payment app to transfer'}
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
                <div className="donate-input-wrapper">
                  <span className="donate-input-icon"><User size={16} /></span>
                  <input
                    type="text"
                    className="donate-input-field"
                    placeholder="e.g. Ramesh Kumar / Anitha Rao"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.3rem', display: 'block' }}>
                  💡 Enter the exact name shown in PhonePe / GPay / Paytm for instant verification.
                </small>
              </div>

              <div className="donate-form-group">
                <label className="donate-form-label">
                  Donation Amount (INR) <span style={{ color: 'var(--danger)' }}>*</span>
                </label>
                <div className="donate-input-wrapper">
                  <span className="donate-input-icon" style={{ fontSize: '1.15rem' }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    className="donate-input-field"
                    placeholder="Enter amount (e.g. 501)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    style={{ fontWeight: 800, fontSize: '1.15rem', color: '#D84315' }}
                  />
                </div>

                {/* Quick Amount Suggestion Chips */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
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
                <div className="donate-input-wrapper">
                  <span className="donate-input-icon"><Phone size={16} /></span>
                  <input
                    type="tel"
                    className="donate-input-field"
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
                <div className="donate-input-wrapper">
                  <span className="donate-input-icon"><Heart size={16} /></span>
                  <input
                    type="text"
                    className="donate-input-field"
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

          {/* STEP 2: Select Payment App & Initiate Transfer */}
          {step === 2 && (
            <div>
              {/* Order Summary Badge */}
              <div style={{ background: 'linear-gradient(135deg, hsl(38, 100%, 97%), hsl(30, 100%, 95%))', border: '1.5px solid hsl(38, 90%, 75%)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Contributing Devotee</div>
                  <strong style={{ fontSize: '0.98rem', color: 'var(--text-main)' }}>{donorName}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Amount</div>
                  <strong style={{ fontSize: '1.35rem', color: '#D84315', fontWeight: 800 }}>₹{parsedAmount.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {/* Committee Payee Info */}
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem', background: '#FFFFFF', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '0.2rem' }}>Payee Account: <strong style={{ color: 'var(--text-main)' }}>{receiverName}</strong></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>UPI ID: <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>{upiId}</strong></span>
                  <button type="button" onClick={handleCopyUpi} className="btn btn-link" style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', color: 'var(--primary)', fontWeight: 700 }}>
                    {copiedUpi ? '✔ Copied' : '📋 Copy VPA'}
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
                Select your payment app to transfer:
              </div>

              {/* Payment App Realistic Buttons Grid */}
              <div className="donate-apps-grid">
                {/* PhonePe */}
                <button
                  type="button"
                  onClick={() => handleRecordDonation('PhonePe', phonepeUrl)}
                  disabled={submitting}
                  className="donate-app-card phonepe"
                >
                  <PhonePeLogo size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#5F259F', lineHeight: 1.2 }}>PhonePe</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Instant UPI</span>
                  </div>
                </button>

                {/* Google Pay */}
                <button
                  type="button"
                  onClick={() => handleRecordDonation('Google Pay', gpayUrl)}
                  disabled={submitting}
                  className="donate-app-card gpay"
                >
                  <GooglePayLogo size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1A73E8', lineHeight: 1.2 }}>Google Pay</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Tez / UPI</span>
                  </div>
                </button>

                {/* Paytm */}
                <button
                  type="button"
                  onClick={() => handleRecordDonation('Paytm', paytmUrl)}
                  disabled={submitting}
                  className="donate-app-card paytm"
                >
                  <PaytmLogo size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#002970', lineHeight: 1.2 }}>Paytm</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Wallet / UPI</span>
                  </div>
                </button>

                {/* Any UPI / BHIM */}
                <button
                  type="button"
                  onClick={() => handleRecordDonation('UPI App', standardUpiUrl)}
                  disabled={submitting}
                  className="donate-app-card bhim"
                >
                  <UpiBhimLogo size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#E65100', lineHeight: 1.2 }}>Other UPI</div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>BHIM / Cred</span>
                  </div>
                </button>
              </div>

              {/* QR Code / Desktop Devotee Option */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.85rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', marginBottom: showQr ? '0.75rem' : '0' }}
                >
                  <QrCode size={15} />
                  {showQr ? 'Hide QR Code' : 'Scan QR Code with Phone'}
                </button>

                {showQr && (
                  <div style={{ background: '#ffffff', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'inline-block', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                    <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '180px', height: '180px', display: 'block', margin: '0 auto' }} />
                    <p style={{ margin: '0.4rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Scan via PhonePe, Paytm, or GPay to pay <strong>₹{parsedAmount}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRecordDonation('QR Code Scan')}
                      className="donate-upi-btn"
                      style={{ marginTop: '0.6rem', width: '100%', fontSize: '0.85rem', padding: '0.55rem' }}
                    >
                      I have scanned & paid
                    </button>
                  </div>
                )}
              </div>

              {/* Optional: Enter UPI Ref ID after payment */}
              <div style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>
                  Have a UPI UTR / Transaction Ref ID? (Optional)
                </label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 324156789012"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.6rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRecordDonation('UPI Transfer')}
                    disabled={submitting}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                  >
                    Submit
                  </button>
                </div>
              </div>

              {/* Back Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-link"
                  style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}
                >
                  <ArrowLeft size={14} /> Back to details
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
                  Your donation is recorded in the donor register with status <strong style={{ color: '#E65100' }}>Pending Approval</strong>. The festival treasurer will verify the UPI receipt with the bank statement and approve your record to appear on the public donor honor roll!
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
