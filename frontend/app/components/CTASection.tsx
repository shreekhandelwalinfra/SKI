'use client';

import Link from 'next/link';

export default function CTASection() {
    return (
        <section style={{
            padding: '80px 24px',
            background: 'linear-gradient(135deg, #1B2A4A 0%, #0F0F14 100%)',
            textAlign: 'center',
        }}>
            <div style={{ maxWidth: '560px', margin: '0 auto' }}>
                <h2 style={{
                    fontFamily: 'var(--font-playfair), Georgia, serif',
                    fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700,
                    color: '#F5F0EB', lineHeight: 1.3, marginBottom: '12px',
                }}>
                    Ready to Start Your <span style={{ color: '#C4956A' }}>Investment Journey?</span>
                </h2>
                <p style={{
                    fontSize: '0.9rem', color: '#8888A0', lineHeight: 1.7,
                    fontFamily: 'var(--font-inter), sans-serif',
                    marginBottom: '32px',
                }}>
                    Join thousands of investors earning through verified real estate investments and team-based commissions.
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/user/signup" style={{
                        display: 'inline-block', padding: '14px 36px', borderRadius: '50px',
                        background: 'linear-gradient(135deg, #C4956A, #a87a50)',
                        color: '#fff', fontSize: '0.78rem', fontWeight: 700,
                        letterSpacing: '0.12em', textTransform: 'uppercase',
                        fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(196,149,106,0.25)',
                    }}>
                        Create Account
                    </Link>
                    <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '14px 28px', borderRadius: '50px',
                        background: 'transparent', border: '1px solid rgba(37,211,102,0.25)',
                        color: '#25d366', fontSize: '0.78rem', fontWeight: 600,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        fontFamily: 'var(--font-inter), sans-serif', textDecoration: 'none',
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        WhatsApp Us
                    </a>
                </div>
            </div>
        </section>
    );
}
