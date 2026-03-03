'use client';

import { useState, FormEvent } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export default function ContactPage() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setStatus('sending');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setStatus('sent');
                setFormData({ name: '', email: '', phone: '', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    const inputStyle = {
        width: '100%', padding: '14px 16px', borderRadius: '10px', fontSize: '0.88rem',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        color: '#F5F0EB', fontFamily: 'var(--font-inter), sans-serif',
        outline: 'none', transition: 'border-color 0.2s',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px',
        fontFamily: 'var(--font-inter), sans-serif',
    };

    return (
        <>
            <Navbar />
            <main>
                {/* ═══ HERO ═══ */}
                <section
                    style={{
                        paddingTop: '160px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px',
                        background: 'linear-gradient(160deg, #0a0a12 0%, #111827 40%, #1B2A4A 70%, #0D0D18 100%)',
                        textAlign: 'center',
                    }}
                >
                    <div style={{ maxWidth: '660px', margin: '0 auto' }}>
                        <div style={{
                            display: 'inline-block', padding: '6px 20px', borderRadius: '50px',
                            background: 'rgba(196,149,106,0.08)', border: '1px solid rgba(196,149,106,0.2)',
                            fontSize: '0.62rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                            color: '#C4956A', fontWeight: 600, fontFamily: 'var(--font-inter), sans-serif',
                            marginBottom: '24px',
                        }}>
                            Contact Us
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-playfair), Georgia, serif',
                            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700,
                            color: '#F5F0EB', lineHeight: 1.15, marginBottom: '16px',
                        }}>
                            Get in <span style={{ color: '#C4956A' }}>Touch</span>
                        </h1>
                        <p style={{
                            fontSize: '0.95rem', color: '#8888A0', lineHeight: 1.8,
                            fontFamily: 'var(--font-inter), sans-serif', maxWidth: '480px', margin: '0 auto',
                        }}>
                            Ready to invest? Have questions?
                            Our team is here to help you every step of the way.
                        </p>
                    </div>
                </section>

                {/* ═══ FORM + INFO ═══ */}
                <section style={{ padding: '80px 24px', background: 'var(--bg-primary)' }}>
                    <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '40px' }}>

                        {/* Form Card */}
                        <div style={{
                            padding: '36px 32px', borderRadius: '20px',
                            background: 'rgba(21,21,35,0.6)', backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(196,149,106,0.1)',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
                        }}>
                            <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-heading)', marginBottom: '6px' }}>
                                Send a Message
                            </h2>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '28px' }}>
                                Fill the form and we&apos;ll get back within 24 hours.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={labelStyle}>Full Name</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" style={inputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Email</label>
                                        <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="you@email.com" style={inputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Phone</label>
                                        <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..." style={inputStyle} />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={labelStyle}>Message</label>
                                    <textarea
                                        required rows={4} value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Tell us about your requirements..."
                                        style={{ ...inputStyle, resize: 'vertical' as const }}
                                    />
                                </div>
                                <button
                                    type="submit" disabled={status === 'sending'}
                                    style={{
                                        width: '100%', padding: '14px', borderRadius: '10px', cursor: 'pointer',
                                        background: status === 'sent' ? 'rgba(52,211,153,0.15)' : 'linear-gradient(135deg, #C4956A, #a87a50)',
                                        border: status === 'sent' ? '1px solid rgba(52,211,153,0.2)' : 'none',
                                        color: status === 'sent' ? '#34D399' : '#fff',
                                        fontSize: '0.88rem', fontWeight: 700,
                                        fontFamily: 'var(--font-inter), sans-serif',
                                        opacity: status === 'sending' ? 0.7 : 1,
                                        boxShadow: status === 'sent' ? 'none' : '0 4px 15px rgba(196,149,106,0.25)',
                                        transition: 'all 0.3s',
                                    }}
                                >
                                    {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Message Sent!' : 'Send Message'}
                                </button>
                                {status === 'error' && (
                                    <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '10px', textAlign: 'center' }}>Failed to send. Please try again.</p>
                                )}
                            </form>
                        </div>

                        {/* Info side */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h2 style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--text-heading)', marginBottom: '8px' }}>
                                Office Details
                            </h2>

                            {[
                                { icon: '📍', label: 'Head Office', value: 'Pan-India Operations — Uttar Pradesh', color: '#C4956A' },
                                { icon: '📞', label: 'Phone', value: '+91 XXXXXXXXXX', color: '#34D399' },
                                { icon: '📧', label: 'Email', value: 'info@ski-infra.com', color: '#60A5FA' },
                                { icon: '🕐', label: 'Working Hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM', color: '#FBBF24' },
                            ].map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: '16px', alignItems: 'center',
                                    padding: '18px 20px', borderRadius: '14px',
                                    background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
                                    borderLeft: `3px solid ${item.color}`,
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: `${item.color}10`, fontSize: '1.1rem',
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>
                                            {item.label}
                                        </p>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)' }}>{item.value}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Locations */}
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                    Our Locations
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {['Noida', 'Greater Noida', 'Jewar', 'Delhi NCR', 'Mathura', 'Vrindavan'].map(loc => (
                                        <span key={loc} style={{
                                            padding: '6px 16px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 500,
                                            background: 'rgba(196,149,106,0.06)', border: '1px solid rgba(196,149,106,0.12)',
                                            color: '#C4956A', fontFamily: 'var(--font-inter), sans-serif',
                                        }}>
                                            {loc}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
