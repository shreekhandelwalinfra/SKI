'use client';

import Link from 'next/link';
import { CATEGORY_LABELS, PropertyCategory } from '../lib/types';

const categoryImages: Record<PropertyCategory, string> = {
    'residential-land': '🏡',
    'commercial-land': '🏢',
    'mvda-approved': '✅',
    'mathura-vrindavan': '🛕',
    'noida-greater-noida-jewar': '🏙️',
};

const categoryDescriptions: Record<PropertyCategory, string> = {
    'residential-land': 'Premium residential plots in prime locations for your dream home.',
    'commercial-land': 'Strategic commercial plots with high ROI potential.',
    'mvda-approved': 'Government-approved projects with complete legal clearance.',
    'mathura-vrindavan': 'Sacred city plots in the spiritual heartland of India.',
    'noida-greater-noida-jewar': 'Fast-developing NCR region near Jewar Airport.',
};

export default function CategoryCards() {
    return (
        <section className="section-padding" style={{ background: 'var(--bg-surface)' }}>
            <div className="container-max">
                {/* Header */}
                <div className="text-center mb-14">
                    <span className="section-label">Explore Categories</span>
                    <h2 className="section-title">Investment Opportunities</h2>
                    <div className="copper-line copper-line-center" />
                    <p className="section-subtitle mx-auto mt-4">
                        Discover diverse property categories across our key operational zones in North India.
                    </p>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Object.entries(CATEGORY_LABELS) as [PropertyCategory, string][]).map(([key, label], index) => (
                        <Link
                            key={key}
                            href={`/properties?category=${key}`}
                            className="group card p-8 relative overflow-hidden"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Background Gradient on Hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{
                                    background: 'linear-gradient(135deg, var(--accent-copper-subtle), transparent)',
                                }}
                            />

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="text-4xl mb-4">{categoryImages[key]}</div>

                                {/* Title */}
                                <h3
                                    className="text-xl font-bold mb-2 group-hover:text-copper transition-colors"
                                    style={{ fontFamily: 'var(--font-playfair)' }}
                                >
                                    {label}
                                </h3>

                                {/* Description */}
                                <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                    {categoryDescriptions[key]}
                                </p>

                                {/* Arrow */}
                                <span
                                    className="inline-flex items-center gap-2 text-sm font-medium transition-all group-hover:gap-3"
                                    style={{ color: 'var(--accent-copper)' }}
                                >
                                    View Properties
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
