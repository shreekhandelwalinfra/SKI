'use client';

import { useEffect, useState } from 'react';
import { getUserInvestments, createUserInvestment, getUserPropertyDeals } from '../lib/api';
import useSWR from 'swr';
import { useSocket } from '../../../lib/SocketContext';

export default function InvestmentsPage() {
    const [showForm, setShowForm] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [formCategory, setFormCategory] = useState<'existing' | 'new'>('new');
    const [form, setForm] = useState({
        propertyDealId: '', propertyName: '', unitNumber: '', plotAreaSize: '', propertyValue: '',
        propertyAddress: '', amount: '', installmentNo: '1', isFinal: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const { socket } = useSocket();

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user-data');
            if (stored) {
                const u = JSON.parse(stored);
                if (u.status?.toLowerCase() === 'active') setIsApproved(true);
            }
        } catch { }
    }, []);

    const fetchInvestments = async () => {
        const res = await getUserInvestments();
        return res.data;
    };

    const { data: investmentsData, isLoading: loading, mutate: loadInvestments } = useSWR('user_investments', fetchInvestments);
    const investments = investmentsData || [];

    const fetchDeals = async () => {
        const res = await getUserPropertyDeals();
        return res.data;
    };
    const { data: dealsData, mutate: loadDeals } = useSWR('user_property_deals', fetchDeals);
    const deals = dealsData || [];

    useEffect(() => {
        if (deals.length > 0 && formCategory === 'new') {
            setFormCategory('existing');
        }
    }, [deals.length]);

    // Socket.io — listen for real-time investment changes
    useEffect(() => {
        socket.on('investment:updated', () => { loadInvestments(); loadDeals(); });
        return () => { socket.off('investment:updated', () => { loadInvestments(); loadDeals(); }); };
    }, [socket, loadInvestments]);

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    const sBadge = (s: string) => s === 'APPROVED' ? { bg: 'rgba(52,211,153,0.1)', c: '#34D399' } : s === 'REJECTED' ? { bg: 'rgba(239,68,68,0.1)', c: '#ef4444' } : { bg: 'rgba(251,191,36,0.1)', c: '#FBBF24' };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSubmitting(true);
        try {
            const payload = {
                propertyDealId: formCategory === 'existing' ? form.propertyDealId : undefined,
                propertyName: formCategory === 'new' ? form.propertyName : undefined,
                unitNumber: formCategory === 'new' ? form.unitNumber : undefined,
                plotAreaSize: formCategory === 'new' ? form.plotAreaSize : undefined,
                propertyValue: formCategory === 'new' ? Number(form.propertyValue) : undefined,
                propertyAddress: formCategory === 'new' ? form.propertyAddress : undefined,
                amount: Number(form.amount),
                installmentNo: form.isFinal ? 'Final' : form.installmentNo,
            };
            const res = await createUserInvestment(payload);
            loadInvestments();
            loadDeals();
            setForm({ propertyDealId: '', propertyName: '', unitNumber: '', plotAreaSize: '', propertyValue: '', propertyAddress: '', amount: '', installmentNo: '1', isFinal: false });
            setShowForm(false);
            setSuccess('Investment submitted successfully! It will appear after admin approval.');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err: any) {
            const msg = err?.response?.data?.code === 'ACCOUNT_PENDING'
                ? 'Your account is pending activation. Please wait for admin approval before submitting investments.'
                : (err.message || 'Failed to submit investment. Please login again.');
            setError(msg);
            setTimeout(() => setError(''), 5000);
        } finally { setSubmitting(false); }
    };

    const fieldLabel = (label: string) => (
        <label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{label}</label>
    );

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;

    if (!isApproved) {
        return (
            <div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="section-label" style={{ fontSize: '0.65rem' }}>Portfolio</div>
                    <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Property Investments</h2>
                </div>

                <div style={{
                    padding: '60px 24px', borderRadius: '16px',
                    background: 'linear-gradient(160deg, #0D0D18 0%, #111827 50%, #1B2A4A 100%)',
                    textAlign: 'center', border: '1px solid rgba(196,149,106,0.15)'
                }}>
                    <div style={{ maxWidth: '520px', margin: '0 auto' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(196,149,106,0.15), rgba(196,149,106,0.05))',
                            border: '2px solid rgba(196,149,106,0.25)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px',
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C4956A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>

                        <h2 style={{
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: '1.5rem', fontWeight: 700, color: '#F5F0EB',
                            marginBottom: '12px', lineHeight: 1.3,
                        }}>
                            Investments Locked
                        </h2>

                        <p style={{ fontSize: '0.92rem', color: '#8888A0', lineHeight: 1.7, marginBottom: '8px' }}>
                            Your account is currently <span style={{ color: '#FBBF24', fontWeight: 600 }}>pending approval</span>.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#6B6B80', lineHeight: 1.7 }}>
                            You cannot view or make new property investments until the admin verifies your account. Please wait for activation.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div>
                    <div className="section-label" style={{ fontSize: '0.65rem' }}>Portfolio</div>
                    <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)' }}>Property Investments</h2>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                    style={{ borderRadius: '6px', fontSize: '0.75rem' }}
                >
                    {showForm ? 'Cancel' : '+ New Investment'}
                </button>
            </div>

            {success && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.15)' }}>✓ {success}</div>}
            {error && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.15)' }}>✗ {error}</div>}

            {showForm && (
                <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <div className="section-label" style={{ fontSize: '0.6rem' }}>Submit Property Investment</div>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.75rem' }}>
                        {/* New vs Existing Toggle */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', marginTop: '-0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="radio" name="formCategory" value="new" checked={formCategory === 'new'} onChange={() => setFormCategory('new')} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                                <span>Buy New Property</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                <input type="radio" name="formCategory" value="existing" checked={formCategory === 'existing'} onChange={() => setFormCategory('existing')} style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }} />
                                <span>Pay Installment (Existing Property)</span>
                            </label>
                        </div>

                        {formCategory === 'existing' ? (
                            <div style={{ paddingBottom: '0.5rem' }}>
                                {fieldLabel('Select Property Deal')}
                                <select
                                    value={form.propertyDealId}
                                    onChange={e => setForm(p => ({ ...p, propertyDealId: e.target.value }))}
                                    className="input"
                                    required
                                    style={{ width: '100%', cursor: 'pointer' }}
                                >
                                    <option value="" disabled>-- Select a Property Deal --</option>
                                    {deals.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.propertyName} {d.unitNumber ? `(Unit: ${d.unitNumber})` : ''} - Total: {fmt(d.totalDealAmount)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                {/* Row 1: Property Name + Unit Number */}
                                <div className="responsive-grid-2">
                                    <div>
                                        {fieldLabel('Project / Property Name')}
                                        <input value={form.propertyName} onChange={e => setForm(p => ({ ...p, propertyName: e.target.value }))} className="input" placeholder="e.g., Green Valley Residency" required />
                                    </div>
                                    <div>
                                        {fieldLabel('Unit / Plot Number')}
                                        <input value={form.unitNumber} onChange={e => setForm(p => ({ ...p, unitNumber: e.target.value }))} className="input" placeholder="e.g., A-54" required />
                                    </div>
                                </div>

                                {/* Row 1b: Plot Area + Property Value */}
                                <div className="responsive-grid-2">
                                    <div>
                                        {fieldLabel('Plot Area / Size')}
                                        <input value={form.plotAreaSize} onChange={e => setForm(p => ({ ...p, plotAreaSize: e.target.value }))} className="input" placeholder="e.g., 1200 sqft, 150 sqyd" required />
                                    </div>
                                    <div>
                                        {fieldLabel('Total Property Value (₹)')}
                                        <input type="number" value={form.propertyValue} onChange={e => setForm(p => ({ ...p, propertyValue: e.target.value }))} className="input" placeholder="Total property value" min="1" required />
                                    </div>
                                </div>

                                {/* Row 2: Property Address */}
                                <div>
                                    {fieldLabel('Property Address')}
                                    <textarea value={form.propertyAddress} onChange={e => setForm(p => ({ ...p, propertyAddress: e.target.value }))} className="input" style={{ minHeight: '60px' }} placeholder="Full property address — Sector, City, State" required />
                                </div>
                            </>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.5rem 0' }} />

                        {/* Always show Investment Amount and Installment details */}
                        <div className="responsive-grid-2" style={{ alignItems: 'end' }}>
                            <div>
                                {fieldLabel('Investment Amount (₹)')}
                                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} className="input" placeholder="Amount for this installment" min="1" required />
                            </div>
                            <div>
                                {fieldLabel('Installment No.')}
                                <input
                                    type="number"
                                    value={form.installmentNo}
                                    onChange={e => setForm(p => ({ ...p, installmentNo: e.target.value }))}
                                    className="input"
                                    min="1"
                                    placeholder="e.g., 1, 2, 15, 30..."
                                    disabled={form.isFinal}
                                    style={{ opacity: form.isFinal ? 0.4 : 1 }}
                                    required={!form.isFinal}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingBottom: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                                <input
                                    type="checkbox"
                                    checked={form.isFinal}
                                    onChange={e => setForm(p => ({ ...p, isFinal: e.target.checked }))}
                                    style={{ accentColor: '#34D399', width: '16px', height: '16px', cursor: 'pointer' }}
                                />
                                <span style={{ fontSize: '0.8rem', color: form.isFinal ? '#34D399' : 'var(--text-muted)', fontWeight: form.isFinal ? 600 : 400 }}>
                                    Mark as Final Installment
                                </span>
                            </label>
                        </div>

                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ borderRadius: '6px', alignSelf: 'flex-start', opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? 'Submitting...' : 'Submit Investment'}
                        </button>
                    </form>
                </div>
            )}

            <div className="card" style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontFamily: 'var(--font-inter), sans-serif' }}>
                        <thead><tr style={{ background: 'var(--bg-surface-alt)' }}>
                            {['#', 'Property', 'Area', 'Investment', 'Inst.', 'Date', 'Status', 'Remarks'].map(h => (
                                <th key={h} className="text-tracked" style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 500 }}>{h}</th>
                            ))}
                        </tr></thead>
                        <tbody>
                            {investments.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No investments yet</td></tr> : investments.map((inv: any, i: number) => {
                                const sb = sBadge(inv.status);
                                return (
                                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                                                {inv.propertyName || inv.type || '—'}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {inv.propertyAddress?.split(',')[0] || ''} {inv.unitNumber ? `• Unit: ${inv.unitNumber}` : ''}
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{inv.plotAreaSize || '—'}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ fontWeight: 600, color: '#34D399' }}>{fmt(inv.amount)}</div>
                                            {inv.propertyValue > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>of {fmt(inv.propertyValue)}</div>}
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{
                                                padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600,
                                                background: inv.installmentNo === 'Final' ? 'rgba(52,211,153,0.1)' : 'rgba(var(--accent-copper-rgb, 184,115,51),0.1)',
                                                color: inv.installmentNo === 'Final' ? '#34D399' : 'var(--accent-copper)',
                                            }}>
                                                {inv.installmentNo === 'Final' ? '✓ Final' : `#${inv.installmentNo || '1'}`}
                                            </span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(inv.transactionDate)}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}><span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: sb.bg, color: sb.c }}>{inv.status}</span></td>
                                        <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{inv.remarks || '—'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
