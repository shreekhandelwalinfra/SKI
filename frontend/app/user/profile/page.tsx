'use client';

import { useState } from 'react';
import { getUserProfile, updateUserProfile, changeUserPassword, updateBankDetails } from '../lib/api';
import useSWR from 'swr';

export default function ProfilePage() {
    const [tab, setTab] = useState<'personal' | 'bank' | 'password'>('personal');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [personal, setPersonal] = useState({ name: '', phone: '', address: '', city: '', state: '', pincode: '', panNumber: '', aadharNumber: '', dateOfBirth: '' });
    const [bank, setBank] = useState({ accountHolder: '', accountNumber: '', ifscCode: '', bankName: '', branchName: '', upiId: '' });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [initialized, setInitialized] = useState(false);

    const fetchProfile = async () => {
        const res = await getUserProfile();
        const d = res.data;
        if (!initialized) {
            setPersonal({ name: d.name || '', phone: d.phone || '', address: d.address || '', city: d.city || '', state: d.state || '', pincode: d.pincode || '', panNumber: d.panNumber || '', aadharNumber: d.aadharNumber || '', dateOfBirth: d.dateOfBirth || '' });
            if (d.bankDetail) setBank({ accountHolder: d.bankDetail.accountHolder || '', accountNumber: d.bankDetail.accountNumber || '', ifscCode: d.bankDetail.ifscCode || '', bankName: d.bankDetail.bankName || '', branchName: d.bankDetail.branchName || '', upiId: d.bankDetail.upiId || '' });
            setInitialized(true);
        }
        return d;
    };

    const { data: profile, isLoading: loading } = useSWR('user_profile', fetchProfile);

    const showMsg = (t: string, text: string) => { setMsg({ type: t, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); };
    const handlePersonal = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await updateUserProfile(personal); showMsg('success', 'Profile updated successfully!'); } catch (err: any) { showMsg('error', err.message); } finally { setSaving(false); } };
    const handleBank = async (e: React.FormEvent) => { e.preventDefault(); setSaving(true); try { await updateBankDetails(bank); showMsg('success', 'Bank details updated!'); } catch (err: any) { showMsg('error', err.message); } finally { setSaving(false); } };
    const handlePassword = async (e: React.FormEvent) => { e.preventDefault(); if (pwd.newPassword !== pwd.confirmPassword) { showMsg('error', 'Passwords do not match'); return; } if (pwd.newPassword.length < 6) { showMsg('error', 'Minimum 6 characters'); return; } setSaving(true); try { await changeUserPassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword }); showMsg('success', 'Password changed!'); setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' }); } catch (err: any) { showMsg('error', err.message); } finally { setSaving(false); } };

    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '16rem' }}><div className="skeleton" style={{ width: '200px', height: '16px' }} /></div>;

    const personalFields = [
        { key: 'name', label: 'Full Name', type: 'text' }, { key: 'phone', label: 'Phone', type: 'tel' },
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' }, { key: 'address', label: 'Address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' }, { key: 'state', label: 'State', type: 'text' },
        { key: 'pincode', label: 'Pincode', type: 'text' }, { key: 'panNumber', label: 'PAN Number', type: 'text' },
        { key: 'aadharNumber', label: 'Aadhaar Number', type: 'text' },
    ];
    const bankFields = [
        { key: 'accountHolder', label: 'Account Holder' }, { key: 'accountNumber', label: 'Account Number' },
        { key: 'ifscCode', label: 'IFSC Code' }, { key: 'bankName', label: 'Bank Name' },
        { key: 'branchName', label: 'Branch Name' }, { key: 'upiId', label: 'UPI ID' },
    ];

    return (
        <div>
            {/* Profile Header */}
            <div className="card" style={{ borderRadius: '10px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-copper)', color: '#fff', fontFamily: 'var(--font-playfair), Georgia, serif', fontWeight: 700, fontSize: '1.5rem', flexShrink: 0 }}>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth: 0 }}>
                    <h2 className="heading-serif" style={{ fontSize: '1.25rem', color: 'var(--text-heading)', marginBottom: '0.15rem' }}>{profile?.name}</h2>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-inter), sans-serif' }}>{profile?.email}</div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'monospace', background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)' }}>{profile?.uniqueId}</span>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500, background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>Rank {profile?.rank}</span>
                    </div>
                </div>
            </div>

            {msg.text && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.85rem', background: msg.type === 'success' ? 'rgba(52,211,153,0.08)' : 'rgba(239,68,68,0.08)', color: msg.type === 'success' ? '#34D399' : '#ef4444', border: `1px solid ${msg.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)'}` }}>{msg.type === 'success' ? '✓' : '✗'} {msg.text}</div>}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {[{ k: 'personal', l: 'Personal Info' }, { k: 'bank', l: 'Bank Details' }, { k: 'password', l: 'Change Password' }].map(t => (
                    <button key={t.k} onClick={() => setTab(t.k as any)}
                        style={{ padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.05em', cursor: 'pointer', fontFamily: 'var(--font-inter), sans-serif', border: '1px solid', borderColor: tab === t.k ? 'var(--accent-copper)' : 'var(--border-color)', background: tab === t.k ? 'var(--accent-copper)' : 'transparent', color: tab === t.k ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                        {t.l}
                    </button>
                ))}
            </div>

            {tab === 'personal' && (
                <form onSubmit={handlePersonal} className="card" style={{ borderRadius: '10px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        {personalFields.map(f => (
                            <div key={f.key}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{f.label}</label>
                                <input type={f.type} value={(personal as any)[f.key]} onChange={e => setPersonal(p => ({ ...p, [f.key]: e.target.value }))} className="input" />
                            </div>
                        ))}
                    </div>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ borderRadius: '6px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Update Profile'}</button>
                </form>
            )}

            {tab === 'bank' && (
                <form onSubmit={handleBank} className="card" style={{ borderRadius: '10px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                        {bankFields.map(f => (
                            <div key={f.key}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{f.label}</label>
                                <input value={(bank as any)[f.key]} onChange={e => setBank(p => ({ ...p, [f.key]: e.target.value }))} className="input" />
                            </div>
                        ))}
                    </div>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ borderRadius: '6px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Update Bank Details'}</button>
                </form>
            )}

            {tab === 'password' && (
                <form onSubmit={handlePassword} className="card" style={{ borderRadius: '10px', padding: '1.5rem', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
                        {['currentPassword', 'newPassword', 'confirmPassword'].map(k => (
                            <div key={k}>
                                <label className="text-tracked" style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                                    {k === 'currentPassword' ? 'Current Password' : k === 'newPassword' ? 'New Password' : 'Confirm New Password'}
                                </label>
                                <input type="password" value={(pwd as any)[k]} onChange={e => setPwd(p => ({ ...p, [k]: e.target.value }))} className="input" required />
                            </div>
                        ))}
                    </div>
                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ borderRadius: '6px', opacity: saving ? 0.7 : 1 }}>{saving ? 'Changing...' : 'Change Password'}</button>
                </form>
            )}
        </div>
    );
}
