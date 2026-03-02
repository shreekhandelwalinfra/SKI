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

    return (
        <>
            <Navbar />
            <main>
                {/* Hero */}
                <section
                    className="pt-32 pb-20 px-6"
                    style={{ background: 'linear-gradient(135deg, #0F0F14 0%, #1B2A4A 100%)' }}
                >
                    <div className="container-max text-center">
                        <span className="section-label">Contact Us</span>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                        >
                            Get in <span style={{ color: 'var(--accent-copper)' }}>Touch</span>
                        </h1>
                        <div className="copper-line copper-line-center" />
                        <p className="text-lg max-w-xl mx-auto mt-6" style={{ color: '#C0B8AE' }}>
                            Ready to invest? Have questions? Our team is here to help you every step of the way.
                        </p>
                    </div>
                </section>

                {/* Contact Form + Info */}
                <section className="section-padding">
                    <div className="container-max">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Form */}
                            <div>
                                <h2 className="section-title text-2xl mb-6">Send Us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            className="input"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Email *</label>
                                            <input
                                                type="email"
                                                required
                                                className="input"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2">Phone *</label>
                                            <input
                                                type="tel"
                                                required
                                                className="input"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+91 "
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message *</label>
                                        <textarea
                                            required
                                            className="input"
                                            rows={5}
                                            value={formData.message}
                                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us about your requirements..."
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full py-4"
                                        disabled={status === 'sending'}
                                    >
                                        {status === 'sending' ? 'Sending...' : status === 'sent' ? '✓ Message Sent!' : 'Send Message'}
                                    </button>
                                    {status === 'error' && (
                                        <p className="text-sm text-red-500">Failed to send. Please try again.</p>
                                    )}
                                </form>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Office Information</h3>
                                    <div className="space-y-4">
                                        {[
                                            { icon: '📍', label: 'Head Office', value: 'Pan-India Operations — Uttar Pradesh' },
                                            { icon: '📞', label: 'Phone', value: '+91 XXXXXXXXXX' },
                                            { icon: '📧', label: 'Email', value: 'info@ski-infra.com' },
                                            { icon: '🕐', label: 'Working Hours', value: 'Mon - Sat: 9:00 AM - 7:00 PM' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                                                <span className="text-xl">{item.icon}</span>
                                                <div>
                                                    <p className="text-sm font-medium">{item.label}</p>
                                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Our Locations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Noida', 'Greater Noida', 'Jewar', 'Delhi NCR', 'Mathura', 'Vrindavan'].map(loc => (
                                            <span
                                                key={loc}
                                                className="text-sm px-4 py-2 rounded-full"
                                                style={{ background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)' }}
                                            >
                                                {loc}
                                            </span>
                                        ))}
                                    </div>
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
