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

        if (newPassword !== confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters.');
            return;
        }

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

    return (
        <div className="max-w-md">
            <div className="p-6 rounded-lg" style={{ background: '#1A1A24', border: '1px solid #2E2E3E' }}>
                <h2 className="text-sm font-medium mb-5 tracking-wider" style={{ color: '#C4956A', letterSpacing: '0.1em' }}>
                    UPDATE PASSWORD
                </h2>

                {message && (
                    <div className="mb-4 px-4 py-2 rounded text-sm" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 px-4 py-2 rounded text-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A96' }}>Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded text-sm outline-none"
                            style={{ background: '#22222E', border: '1px solid #333340', color: '#F5F0EB' }}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A96' }}>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded text-sm outline-none"
                            style={{ background: '#22222E', border: '1px solid #333340', color: '#F5F0EB' }}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-xs uppercase tracking-wider mb-2" style={{ color: '#8A8A96' }}>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded text-sm outline-none"
                            style={{ background: '#22222E', border: '1px solid #333340', color: '#F5F0EB' }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded text-xs uppercase tracking-widest font-medium transition-all"
                        style={{ background: loading ? '#8A7A5A' : '#C4956A', color: '#FFF', letterSpacing: '0.15em' }}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
