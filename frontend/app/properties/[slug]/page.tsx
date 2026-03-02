'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { Property, CATEGORY_LABELS, formatPrice, formatArea } from '../../lib/types';

export default function PropertyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [inquiryForm, setInquiryForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [inquiryStatus, setInquiryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

    useEffect(() => {
        fetchProperty();
    }, [slug]);

    const fetchProperty = async () => {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties/${slug}`
            );
            const data = await res.json();
            if (data.data) {
                setProperty(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch property:', error);
        }
        setLoading(false);
    };

    const handleInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setInquiryStatus('sending');
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...inquiryForm,
                    propertyId: property?._id,
                    propertyTitle: property?.title,
                }),
            });
            setInquiryStatus('sent');
            setInquiryForm({ name: '', email: '', phone: '', message: '' });
        } catch {
            setInquiryStatus('idle');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="pt-24 pb-20">
                    <div className="container-max px-6">
                        <div className="skeleton h-96 mb-8 rounded-lg" />
                        <div className="skeleton h-8 w-2/3 mb-4" />
                        <div className="skeleton h-6 w-1/3 mb-8" />
                    </div>
                </main>
            </>
        );
    }

    if (!property) {
        return (
            <>
                <Navbar />
                <main className="pt-32 pb-20 text-center">
                    <div className="container-max px-6">
                        <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                            Property Not Found
                        </h1>
                        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
                            The property you&apos;re looking for doesn&apos;t exist or has been removed.
                        </p>
                        <Link href="/properties" className="btn btn-primary">
                            Browse All Properties
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="pt-24 pb-20">
                <div className="container-max px-6">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
                        <Link href="/" className="hover:text-copper transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/properties" className="hover:text-copper transition-colors">Properties</Link>
                        <span>/</span>
                        <span style={{ color: 'var(--accent-copper)' }}>{property.title}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Image Gallery */}
                            <div
                                className="relative h-80 md:h-[450px] rounded-lg overflow-hidden mb-6 flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, var(--bg-surface-alt), var(--border-subtle))' }}
                            >
                                {property.images?.length > 0 ? (
                                    <img
                                        src={property.images[activeImage]?.url}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-8xl opacity-15">🏗️</span>
                                )}
                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span
                                        className="text-xs px-3 py-1.5 rounded-full font-medium"
                                        style={{ background: 'var(--accent-copper)', color: '#FFFFFF' }}
                                    >
                                        {CATEGORY_LABELS[property.category]}
                                    </span>
                                    {property.isMVDAApproved && (
                                        <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-green-500 text-white">
                                            MVDA Approved ✓
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnails */}
                            {property.images?.length > 1 && (
                                <div className="flex gap-3 mb-8 overflow-x-auto">
                                    {property.images.map((img, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImage(i)}
                                            className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 transition-all"
                                            style={{
                                                border: i === activeImage ? '2px solid var(--accent-copper)' : '2px solid transparent',
                                                opacity: i === activeImage ? 1 : 0.6,
                                            }}
                                        >
                                            <img src={img.url} alt="" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Title & Location */}
                            <h1
                                className="text-3xl md:text-4xl font-bold mb-3"
                                style={{ fontFamily: 'var(--font-playfair)' }}
                            >
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {property.location.address && `${property.location.address}, `}{property.location.city}, {property.location.state}
                                {property.location.pincode && ` - ${property.location.pincode}`}
                            </div>

                            {/* Key Details Grid */}
                            <div
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-lg mb-8"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                            >
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Price</p>
                                    <p className="text-lg font-bold" style={{ color: 'var(--accent-copper)' }}>{formatPrice(property.price)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Area</p>
                                    <p className="text-lg font-bold">{formatArea(property.area, property.areaUnit)}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Facing</p>
                                    <p className="text-lg font-bold">{property.facing || 'N/A'}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Possession</p>
                                    <p className="text-lg font-bold">{property.possession || 'Ready'}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Description</h2>
                                <p className="leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    {property.description || 'Contact us for more details about this property.'}
                                </p>
                            </div>

                            {/* Highlights */}
                            {property.highlights?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Highlights</h2>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {property.highlights.map((h, i) => (
                                            <li key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--accent-copper)' }}>✓</span> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Amenities */}
                            {property.amenities?.length > 0 && (
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>Amenities</h2>
                                    <div className="flex flex-wrap gap-3">
                                        {property.amenities.map((a, i) => (
                                            <span
                                                key={i}
                                                className="text-sm px-4 py-2 rounded-full"
                                                style={{ background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)' }}
                                            >
                                                {a}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div
                                className="sticky top-28 rounded-lg p-6"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                            >
                                {/* Price */}
                                <div className="text-center mb-6 pb-6" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <p className="text-3xl font-bold" style={{ color: 'var(--accent-copper)', fontFamily: 'var(--font-playfair)' }}>
                                        {formatPrice(property.price)}
                                    </p>
                                    <p className="text-sm mt-1 uppercase" style={{ color: 'var(--text-muted)' }}>
                                        For {property.listingType}
                                    </p>
                                </div>

                                {/* Inquiry Form */}
                                <h3 className="text-lg font-bold mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    Interested? Get in Touch
                                </h3>
                                <form onSubmit={handleInquiry} className="space-y-4">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Your Name"
                                        className="input"
                                        value={inquiryForm.name}
                                        onChange={e => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                                    />
                                    <input
                                        type="email"
                                        required
                                        placeholder="Email"
                                        className="input"
                                        value={inquiryForm.email}
                                        onChange={e => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                                    />
                                    <input
                                        type="tel"
                                        required
                                        placeholder="Phone"
                                        className="input"
                                        value={inquiryForm.phone}
                                        onChange={e => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                                    />
                                    <textarea
                                        required
                                        placeholder="I'm interested in this property..."
                                        className="input"
                                        rows={3}
                                        value={inquiryForm.message}
                                        onChange={e => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full py-3"
                                        disabled={inquiryStatus === 'sending'}
                                    >
                                        {inquiryStatus === 'sent' ? '✓ Inquiry Sent!' : inquiryStatus === 'sending' ? 'Sending...' : 'Send Inquiry'}
                                    </button>
                                </form>

                                {/* WhatsApp Direct */}
                                <a
                                    href={`https://wa.me/91XXXXXXXXXX?text=${encodeURIComponent(`Hi! I'm interested in: ${property.title} (${formatPrice(property.price)})`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn w-full py-3 mt-3"
                                    style={{ background: '#25D366', color: '#FFFFFF' }}
                                >
                                    💬 Chat on WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
