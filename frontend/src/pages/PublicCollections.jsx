import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Heart, ShieldCheck, Landmark } from 'lucide-react';

const PublicCollections = () => {
  const { settings } = useAuth();
  const [data, setData] = useState({ publicVisible: true, showDonorsList: true, totalAmount: 0, donorsCount: 0, collections: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/collections`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="page-container">
      <div className="action-header">
        <div>
          <h1 style={{ color: 'var(--primary)', fontSize: '2rem' }}>🙏 Donor & Collection Summary</h1>
          <p style={{ color: 'var(--text-muted)' }}>Public log of contributions supporting the Vinayaka Chavithi celebrations.</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>Loading donation logs...</div>
      ) : (
        <div>
          {/* Summary Dashboard Card (Only show if publicVisible is true) */}
          {data.publicVisible && (
            <div className="grid-3" style={{ marginBottom: '2rem' }}>
              <div className="card card-festive-border span-2" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--grad-festive)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
                  <Heart size={28} fill="white" />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Total Festival Collection
                  </span>
                  <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)' }}>
                    ₹{(data.totalAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="card card-festive-border" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ background: 'var(--grad-gold)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: 'var(--radius-sm)' }}>
                  <Landmark size={28} />
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
                    Public Donors
                  </span>
                  <span style={{ display: 'block', fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-dark)' }}>
                    {data.donorsCount !== undefined ? data.donorsCount : data.collections.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Donation Bank / UPI Details Card */}
          <div className="card glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem', border: '1px solid rgba(255, 102, 0, 0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>💳</span> Support Our Festival - Donation Details
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Your contributions fund Puja materials, community Annadanam dinners, and stage decorations.
              </p>
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
              <div style={{ marginBottom: '0.1rem' }}>Account Name: <strong style={{ fontWeight: 700 }}>{settings?.accountName || 'UPPUTURI VENKATA GANESH'}</strong></div>
              <div>Payment Number (UPI): <strong style={{ fontWeight: 700 }}>{settings?.paymentNumber || '9948050484'}</strong></div>
            </div>
          </div>

          {/* Donor Table or Hidden Message */}
          {!data.showDonorsList ? (
            <div className="card card-festive-border" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px dashed var(--primary)' }}>
              <div style={{ background: 'rgba(255, 102, 0, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%' }}>
                <ShieldCheck size={32} />
              </div>
              <h2 style={{ color: 'var(--primary)', fontSize: '1.5rem', margin: 0 }}>Donors List Hidden</h2>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Individual donor details are currently kept private by the administrator. The total collection amount and donation banking details remain public.
              </p>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>📜 Approved Donor List</h2>
              {data.collections.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No approved public collection entries logged yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Donor Name</th>
                        <th style={{ textAlign: 'right' }}>Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.collections.map((coll) => (
                        <tr key={coll._id}>
                          <td>{new Date(coll.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                          <td style={{ fontWeight: 600 }}>{coll.donorName}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                            ₹{coll.amount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicCollections;
