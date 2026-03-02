import type { Metadata } from 'next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about Shree Khandelwal Infra (SKI) — 15+ years of excellence in real estate and land investments across Noida, Greater Noida, Jewar, Mathura & Vrindavan.',
};

const milestones = [
    { year: '2008', event: 'Company founded with a vision for premium real estate' },
    { year: '2012', event: 'Expanded operations to Mathura-Vrindavan region' },
    { year: '2016', event: 'Crossed 200+ successful project deliveries' },
    { year: '2020', event: 'Entered Jewar Airport zone market' },
    { year: '2024', event: '500+ properties and growing Pan-India presence' },
];

const team = [
    { name: 'Management Team', role: 'Leadership', description: 'Decades of combined experience in real estate development and investment.' },
    { name: 'Legal Team', role: 'Documentation', description: 'Expert legal advisors ensuring complete compliance and clear titles.' },
    { name: 'Sales Team', role: 'Client Relations', description: 'Dedicated relationship managers for personalized service.' },
];

export default function AboutPage() {
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
                        <span className="section-label">About Us</span>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                        >
                            Shree Khandelwal <span style={{ color: 'var(--accent-copper)' }}>Infra</span>
                        </h1>
                        <div className="copper-line copper-line-center" />
                        <p className="text-lg max-w-2xl mx-auto mt-6" style={{ color: '#C0B8AE' }}>
                            Building trust through transparency in real estate since 2008.
                            Your gateway to premium land investments across North India.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="section-padding">
                    <div className="container-max">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div>
                                <span className="section-label">Our Mission</span>
                                <h2 className="section-title text-2xl">Empowering Investors</h2>
                                <div className="copper-line" />
                                <p className="mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    At SKI, we believe every individual deserves access to verified, high-quality real estate
                                    investments. Our mission is to bridge the gap between premium land opportunities and
                                    aspiring investors through transparency, expertise, and unwavering commitment to quality.
                                </p>
                            </div>
                            <div>
                                <span className="section-label">Our Vision</span>
                                <h2 className="section-title text-2xl">Leading Real Estate Excellence</h2>
                                <div className="copper-line" />
                                <p className="mt-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                    To be the most trusted name in North Indian real estate, known for our integrity,
                                    premium offerings, and commitment to making property investment seamless and
                                    rewarding for every client.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Milestones */}
                <section className="section-padding" style={{ background: 'var(--bg-surface)' }}>
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <span className="section-label">Our Journey</span>
                            <h2 className="section-title">Milestones</h2>
                            <div className="copper-line copper-line-center" />
                        </div>
                        <div className="max-w-3xl mx-auto space-y-8">
                            {milestones.map((m, i) => (
                                <div key={i} className="flex gap-6 items-start">
                                    <div
                                        className="flex-shrink-0 w-20 h-20 rounded-lg flex items-center justify-center text-xl font-bold"
                                        style={{ background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)', fontFamily: 'var(--font-playfair)' }}
                                    >
                                        {m.year}
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">{m.event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Team */}
                <section className="section-padding">
                    <div className="container-max">
                        <div className="text-center mb-12">
                            <span className="section-label">Our People</span>
                            <h2 className="section-title">Expert Teams</h2>
                            <div className="copper-line copper-line-center" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {team.map((member, i) => (
                                <div key={i} className="card p-8 text-center">
                                    <div
                                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl"
                                        style={{ background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)' }}
                                    >
                                        👔
                                    </div>
                                    <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'var(--font-playfair)' }}>{member.name}</h3>
                                    <p className="text-sm mb-3" style={{ color: 'var(--accent-copper)' }}>{member.role}</p>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{member.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <WhatsAppButton />
        </>
    );
}
