import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata: Metadata = {
    title: 'Our Services',
    description: 'Explore SKI services — land buying & selling assistance, MVDA approved project guidance, legal documentation, investment consulting, and property management.',
};

const services = [
    {
        icon: '🏠',
        title: 'Land Buying Assistance',
        description: 'Complete end-to-end support from site visits to registration. We help you find the perfect plot matching your budget and requirements across our operational zones.',
        features: ['Site visits arrangement', 'Price negotiation', 'Documentation support', 'Registry assistance'],
    },
    {
        icon: '💰',
        title: 'Land Selling Services',
        description: 'List your property with us for maximum visibility and best price realization. Our wide network ensures quick transactions with verified buyers.',
        features: ['Property valuation', 'Marketing & listing', 'Buyer verification', 'Transaction management'],
    },
    {
        icon: '✅',
        title: 'MVDA Approved Projects',
        description: 'Specialized guidance on MVDA (Mathura-Vrindavan Development Authority) approved projects with 100% legal clearance and government backing.',
        features: ['Project verification', 'Approval status check', 'Legal compliance', 'Authority liaison'],
    },
    {
        icon: '📋',
        title: 'Legal Documentation',
        description: 'Our expert legal team handles all paperwork — from mutation and registry to NOC and encumbrance certificates.',
        features: ['Title verification', 'Registry process', 'Mutation support', 'NOC procurement'],
    },
    {
        icon: '📈',
        title: 'Investment Consulting',
        description: 'Data-driven investment advice based on market trends, upcoming infrastructure projects, and growth potential of different zones.',
        features: ['Market analysis', 'ROI projections', 'Zone comparison', 'Growth assessment'],
    },
    {
        icon: '🤝',
        title: 'After-Sale Support',
        description: 'Our relationship doesn\'t end at sale. We provide ongoing support for any post-purchase queries, documentation needs, or resale assistance.',
        features: ['Post-purchase queries', 'Resale assistance', 'Document retrieval', 'Ongoing guidance'],
    },
];

export default function ServicesPage() {
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
                        <span className="section-label">What We Offer</span>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                        >
                            Our <span style={{ color: 'var(--accent-copper)' }}>Services</span>
                        </h1>
                        <div className="copper-line copper-line-center" />
                        <p className="text-lg max-w-xl mx-auto mt-6" style={{ color: '#C0B8AE' }}>
                            Comprehensive real estate services tailored to your investment journey.
                        </p>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="section-padding">
                    <div className="container-max">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div
                                    key={index}
                                    className="card p-8 group"
                                >
                                    <span className="text-4xl mb-4 block">{service.icon}</span>
                                    <h3 className="text-xl font-bold mb-3" style={{ fontFamily: 'var(--font-playfair)' }}>
                                        {service.title}
                                    </h3>
                                    <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                                        {service.description}
                                    </p>
                                    <ul className="space-y-2">
                                        {service.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                                <span style={{ color: 'var(--accent-copper)' }}>✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section
                    className="py-20 px-6"
                    style={{ background: 'linear-gradient(135deg, #1B2A4A 0%, #0F0F14 100%)' }}
                >
                    <div className="container-max text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}>
                            Need a Custom Solution?
                        </h2>
                        <p className="text-lg mb-8 max-w-xl mx-auto" style={{ color: '#C0B8AE' }}>
                            Every investment is unique. Let us create a personalized plan for you.
                        </p>
                        <Link href="/contact" className="btn btn-primary px-8 py-4">
                            Schedule a Consultation
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
