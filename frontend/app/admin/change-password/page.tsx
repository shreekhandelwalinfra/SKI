'use client';

import { useState } from 'react';
import { changePassword } from '../lib/api';

export default function ChangePasswordPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (newPassword !== confirmPassword) { setError('New password and confirm password do not match.'); return; }
        if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
        setLoading(true);
        try {
            await changePassword({ currentPassword, newPassword });
            setMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    // Password strength indicator
    const strengthLevel = () => {
        if (!newPassword) return 0;
        let score = 0;
        if (newPassword.length >= 8) score++;
        if (/[A-Z]/.test(newPassword)) score++;
        if (/[0-9]/.test(newPassword)) score++;
        if (/[^A-Za-z0-9]/.test(newPassword)) score++;
        return score;
    };
    const strength = strengthLevel();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', '#f43f5e', '#f59e0b', '#C4956A', '#10b981'][strength];

    const fields = [
        { label: 'Current Password', value: currentPassword, set: setCurrentPassword, id: 'current' },
        { label: 'New Password', value: newPassword, set: setNewPassword, id: 'new' },
        { label: 'Confirm New Password', value: confirmPassword, set: setConfirmPassword, id: 'confirm' },
    ];

    return (
        <div className="animate-slideInUp">
            {/* Page header */}
            <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#7A7A8A', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '4px' }}>Security</div>
                <h1 style={{ fontSize: '1.55rem', fontWeight: 700, color: '#F5F0EB', fontFamily: 'var(--font-playfair), Georgia, serif', letterSpacing: '0.04em' }}>Change Password</h1>
                <div style={{ marginTop: '6px', width: '40px', height: '2px', background: 'linear-gradient(90deg, #C4956A, #D4A574)' }} />
            </div>

            <div style={{ maxWidth: '440px' }}>
                <div className="glass-card" style={{ padding: '2rem' }}>
                    {/* Lock icon header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C4956A' }}>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif' }}>Update Password</div>
                            <div style={{ fontSize: '0.72rem', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginTop: '2px' }}>Keep your account secure</div>
                        </div>
                    </div>

                    {/* Alerts */}
                    {message && (
                        <div style={{ marginBottom: '1.25rem', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.82rem', background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', fontFamily: 'var(--font-inter), sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {message}
                        </div>
                    )}
                    {error && (
                        <div style={{ marginBottom: '1.25rem', padding: '0.7rem 1rem', borderRadius: '8px', fontSize: '0.82rem', background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)', fontFamily: 'var(--font-inter), sans-serif', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {fields.map(f => (
                            <div key={f.id} style={{ marginBottom: '1.1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.63rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#7A7A8A', fontFamily: 'var(--font-inter), sans-serif', marginBottom: '0.5rem' }}>
                                    {f.label}
                                </label>
                                <input
                                    type="password"
                                    value={f.value}
                                    onChange={e => f.set(e.target.value)}
                                    className="admin-input"
                                    required
                                />
                                {/* Strength bar after new password field */}
                                {f.id === 'new' && newPassword && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? strengthColor : 'rgba(255,255,255,0.07)', transition: 'background 0.3s ease' }} />
                                            ))}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', color: strengthColor, fontFamily: 'var(--font-inter), sans-serif', transition: 'color 0.3s' }}>{strengthLabel}</div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', marginTop: '0.5rem', padding: '0.8rem',
                                borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                background: loading ? 'rgba(196,149,106,0.4)' : '#C4956A',
                                color: '#fff', fontSize: '0.78rem', fontWeight: 600,
                                letterSpacing: '0.12em', textTransform: 'uppercase',
                                fontFamily: 'var(--font-inter), sans-serif',
                                boxShadow: loading ? 'none' : '0 4px 16px rgba(196,149,106,0.3)',
                                transition: 'all 0.2s ease',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                        >
                            {loading ? (
                                <>
                                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                                    Update Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
