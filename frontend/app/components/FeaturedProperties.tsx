'use client';

import Link from 'next/link';

const featuredProperties = [
    {
        id: '1',
        name: 'Premium Residential Plot',
        description: 'Luxury residential estate in Sector 150',
        price: '₹45L',
        originalPrice: '₹55L',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80&auto=format&fit=crop',
        slug: 'premium-residential-plot-sector-150',
    },
    {
        id: '2',
        name: 'MVDA Commercial Land',
        description: 'MVDA approved commercial property',
        price: '₹1.2Cr',
        originalPrice: '₹1.5Cr',
        image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80&auto=format&fit=crop',
        slug: 'mvda-approved-commercial-land',
    },
    {
        id: '3',
        name: 'Vrindavan Heritage Plot',
        description: 'Sacred city premium land plots',
        price: '₹32L',
        originalPrice: '₹40L',
        image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80&auto=format&fit=crop',
        slug: 'vrindavan-heritage-land-plot',
    },
    {
        id: '4',
        name: 'Jewar Airport Zone',
        description: 'Strategic plots near Jewar Airport',
        price: '₹85L',
        originalPrice: '₹1.1Cr',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80&auto=format&fit=crop',
        slug: 'jewar-airport-zone-plot',
    },
];

export default function FeaturedProperties() {
    return (
        <section className="section-padding">
            <div className="container-max">
                {/* Section Header */}
                <div className="mb-12">
                    <h2 className="section-title">Featured Properties</h2>
                    <div className="copper-line" />
                </div>

                {/* Property Grid - 1 large + 3 smaller like reference */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* First large card */}
                    <div className="lg:col-span-5">
                        <Link
                            href={`/properties/${featuredProperties[0].slug}`}
                            className="card group block h-full"
                        >
                            <div className="relative overflow-hidden" style={{ height: '320px' }}>
                                <img
                                    src={featuredProperties[0].image}
                                    alt={featuredProperties[0].name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="p-5">
                                <h3
                                    className="text-sm font-bold uppercase tracking-wider mb-1"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    {featuredProperties[0].name}
                                </h3>
                                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                                    {featuredProperties[0].description}
                                </p>
                                <div className="flex items-center gap-3">
                                    <span className="text-base font-bold" style={{ color: 'var(--accent-copper)' }}>
                                        {featuredProperties[0].price}
                                    </span>
                                    <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                                        {featuredProperties[0].originalPrice}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Right column with smaller cards */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {featuredProperties.slice(1).map((property) => (
                            <Link
                                key={property.id}
                                href={`/properties/${property.slug}`}
                                className="card group block"
                            >
                                <div className="relative overflow-hidden" style={{ height: '180px' }}>
                                    <img
                                        src={property.image}
                                        alt={property.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3
                                        className="text-xs font-bold uppercase tracking-wider mb-1"
                                        style={{ fontFamily: 'var(--font-playfair)' }}
                                    >
                                        {property.name}
                                    </h3>
                                    <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                                        {property.description}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold" style={{ color: 'var(--accent-copper)' }}>
                                            {property.price}
                                        </span>
                                        <span className="text-[11px] line-through" style={{ color: 'var(--text-muted)' }}>
                                            {property.originalPrice}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
