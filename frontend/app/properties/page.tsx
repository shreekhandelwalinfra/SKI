'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';
import { Property, CATEGORY_LABELS, LOCATIONS, formatPrice, formatArea, PropertyCategory } from '../lib/types';

export default function PropertiesPage() {
    return (
        <Suspense fallback={
            <>
                <Navbar />
                <main className="pt-32 pb-20">
                    <div className="container-max px-6 text-center">
                        <div className="skeleton h-10 w-64 mx-auto mb-4" />
                        <div className="skeleton h-4 w-48 mx-auto" />
                    </div>
                </main>
            </>
        }>
            <PropertiesContent />
        </Suspense>
    );
}

function PropertiesContent() {
    const searchParams = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
    const [selectedLocation, setSelectedLocation] = useState(searchParams.get('city') || '');
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [sortBy, setSortBy] = useState('-createdAt');

    useEffect(() => {
        fetchProperties();
    }, [selectedCategory, selectedLocation, sortBy]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedLocation) params.set('city', selectedLocation);
            if (searchQuery) params.set('search', searchQuery);
            params.set('sort', sortBy);
            params.set('limit', '24');

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties?${params.toString()}`
            );
            const data = await res.json();
            setProperties(data.data || []);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
            setProperties([]);
        }
        setLoading(false);
    };

    const handleSearch = () => fetchProperties();

    // Placeholder properties for demo when API is not available
    const displayProperties = properties.length > 0 ? properties : [
        {
            _id: '1', title: 'Premium Residential Plot - Sector 150', slug: 'premium-residential-plot-sector-150',
            category: 'residential-land' as PropertyCategory, listingType: 'sale' as const, price: 4500000, priceUnit: 'total' as const,
            area: 1200, areaUnit: 'sqft' as const, location: { address: '', city: 'Noida', state: 'Uttar Pradesh', pincode: '', zone: '' },
            description: 'A prime residential plot in Sector 150, Noida with excellent connectivity.', highlights: [], amenities: [],
            images: [], isFeatured: true, isActive: true, isMVDAApproved: false, possession: 'Immediate',
            facing: 'East', roadWidth: '60ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
            _id: '2', title: 'MVDA Approved Commercial Land', slug: 'mvda-approved-commercial-land',
            category: 'mvda-approved' as PropertyCategory, listingType: 'sale' as const, price: 12000000, priceUnit: 'total' as const,
            area: 2400, areaUnit: 'sqft' as const, location: { address: '', city: 'Mathura', state: 'Uttar Pradesh', pincode: '', zone: '' },
            description: 'Government approved commercial land with clear titles.', highlights: [], amenities: [],
            images: [], isFeatured: true, isActive: true, isMVDAApproved: true, possession: 'Ready',
            facing: 'North', roadWidth: '40ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
            _id: '3', title: 'Vrindavan Heritage Land Plot', slug: 'vrindavan-heritage-land-plot',
            category: 'mathura-vrindavan' as PropertyCategory, listingType: 'sale' as const, price: 3200000, priceUnit: 'total' as const,
            area: 800, areaUnit: 'sqyd' as const, location: { address: '', city: 'Vrindavan', state: 'Uttar Pradesh', pincode: '', zone: '' },
            description: 'A serene plot in the holy city of Vrindavan.', highlights: [], amenities: [],
            images: [], isFeatured: false, isActive: true, isMVDAApproved: false, possession: 'Immediate',
            facing: 'South', roadWidth: '30ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
            _id: '4', title: 'Jewar Airport Zone Premium Plot', slug: 'jewar-airport-zone-premium-plot',
            category: 'noida-greater-noida-jewar' as PropertyCategory, listingType: 'sale' as const, price: 8500000, priceUnit: 'total' as const,
            area: 1500, areaUnit: 'sqyd' as const, location: { address: '', city: 'Jewar', state: 'Uttar Pradesh', pincode: '', zone: '' },
            description: 'Strategic location near the upcoming Jewar International Airport.', highlights: [], amenities: [],
            images: [], isFeatured: true, isActive: true, isMVDAApproved: false, possession: '2025',
            facing: 'West', roadWidth: '60ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
            _id: '5', title: 'Commercial Plot Greater Noida', slug: 'commercial-plot-greater-noida',
            category: 'commercial-land' as PropertyCategory, listingType: 'sale' as const, price: 15000000, priceUnit: 'total' as const,
            area: 3000, areaUnit: 'sqft' as const, location: { address: '', city: 'Greater Noida', state: 'Uttar Pradesh', pincode: '', zone: '' },
            description: 'Prime commercial land in the heart of Greater Noida.', highlights: [], amenities: [],
            images: [], isFeatured: false, isActive: true, isMVDAApproved: false, possession: 'Ready',
            facing: 'East', roadWidth: '80ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
        {
            _id: '6', title: 'Residential Plot Delhi NCR', slug: 'residential-plot-delhi-ncr',
            category: 'residential-land' as PropertyCategory, listingType: 'sale' as const, price: 6200000, priceUnit: 'total' as const,
            area: 1800, areaUnit: 'sqft' as const, location: { address: '', city: 'Delhi NCR', state: 'Delhi', pincode: '', zone: '' },
            description: 'Well-connected residential plot in Delhi NCR region.', highlights: [], amenities: [],
            images: [], isFeatured: false, isActive: true, isMVDAApproved: false, possession: 'Immediate',
            facing: 'North', roadWidth: '40ft', contactPerson: { name: '', phone: '', email: '' },
            views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        },
    ];

    return (
        <>
            <Navbar />
            <main>
                {/* Hero */}
                <section
                    className="pt-32 pb-16 px-6"
                    style={{ background: 'linear-gradient(135deg, #0F0F14 0%, #1B2A4A 100%)' }}
                >
                    <div className="container-max text-center">
                        <span className="section-label">Our Portfolio</span>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                        >
                            {selectedCategory && CATEGORY_LABELS[selectedCategory as PropertyCategory]
                                ? CATEGORY_LABELS[selectedCategory as PropertyCategory]
                                : 'All Properties'}
                        </h1>
                        <div className="copper-line copper-line-center" />
                    </div>
                </section>

                {/* Filters + Grid */}
                <section className="section-padding">
                    <div className="container-max">
                        {/* Filter Bar */}
                        <div
                            className="flex flex-col md:flex-row gap-4 mb-10 p-4 rounded-lg"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
                        >
                            <input
                                type="text"
                                placeholder="Search properties..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                className="input flex-1"
                            />
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                                className="input"
                                style={{ maxWidth: '240px' }}
                            >
                                <option value="">All Categories</option>
                                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                            <select
                                value={selectedLocation}
                                onChange={e => setSelectedLocation(e.target.value)}
                                className="input"
                                style={{ maxWidth: '200px' }}
                            >
                                <option value="">All Locations</option>
                                {LOCATIONS.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="input"
                                style={{ maxWidth: '180px' }}
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="price">Price: Low to High</option>
                                <option value="-price">Price: High to Low</option>
                                <option value="-views">Most Viewed</option>
                            </select>
                            <button onClick={handleSearch} className="btn btn-primary">Search</button>
                        </div>

                        {/* Results Count */}
                        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                            Showing {displayProperties.length} properties
                        </p>

                        {/* Properties Grid */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="card">
                                        <div className="skeleton h-52" />
                                        <div className="p-5 space-y-3">
                                            <div className="skeleton h-5 w-3/4" />
                                            <div className="skeleton h-4 w-1/2" />
                                            <div className="skeleton h-6 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayProperties.map(property => (
                                    <Link
                                        key={property._id}
                                        href={`/properties/${property.slug}`}
                                        className="card group"
                                    >
                                        {/* Image */}
                                        <div
                                            className="relative h-56 overflow-hidden flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg, var(--bg-surface-alt), var(--border-subtle))' }}
                                        >
                                            <span className="text-5xl opacity-20">🏗️</span>
                                            <span
                                                className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full font-medium"
                                                style={{
                                                    background: property.isMVDAApproved ? '#22c55e' : 'var(--accent-copper)',
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                {property.isMVDAApproved ? 'MVDA Approved ✓' : CATEGORY_LABELS[property.category]}
                                            </span>
                                            <span
                                                className="absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-medium uppercase"
                                                style={{ background: 'rgba(0,0,0,0.5)', color: '#FFFFFF' }}
                                            >
                                                For {property.listingType}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3
                                                className="text-lg font-semibold mb-2 group-hover:text-copper transition-colors line-clamp-2"
                                                style={{ fontFamily: 'var(--font-playfair)' }}
                                            >
                                                {property.title}
                                            </h3>

                                            <div className="flex items-center gap-1.5 text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                </svg>
                                                {property.location.city}, {property.location.state}
                                            </div>

                                            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                                                {property.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                                <span className="text-xl font-bold" style={{ color: 'var(--accent-copper)' }}>
                                                    {formatPrice(property.price)}
                                                </span>
                                                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <span>{formatArea(property.area, property.areaUnit)}</span>
                                                    {property.facing && <span>• {property.facing}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
