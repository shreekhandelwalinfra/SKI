import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppButton from '../components/WhatsAppButton';

export const metadata: Metadata = {
    title: 'Blog | Real Estate Insights',
    description: 'Read expert articles on land investment, real estate trends, MVDA regulations, and property market analysis for Noida, Greater Noida, Jewar, Mathura & Vrindavan.',
};

// Placeholder blog posts
const blogPosts = [
    {
        slug: 'why-invest-in-jewar-airport-zone',
        title: 'Why Invest in Jewar Airport Zone?',
        excerpt: 'The Noida International Airport at Jewar is set to transform the real estate landscape of the region. Here\'s why early investment can yield incredible returns.',
        author: 'SKI Team',
        date: '2024-01-15',
        tags: ['Jewar', 'Investment', 'Airport'],
    },
    {
        slug: 'mvda-approved-projects-benefits',
        title: 'Benefits of MVDA Approved Projects',
        excerpt: 'Understanding why MVDA approval is crucial for your property investment in the Mathura-Vrindavan Development Authority region.',
        author: 'SKI Team',
        date: '2024-01-10',
        tags: ['MVDA', 'Legal', 'Mathura'],
    },
    {
        slug: 'top-areas-noida-real-estate-2024',
        title: 'Top Areas for Real Estate in Noida 2024',
        excerpt: 'A comprehensive guide to the most promising sectors and areas for property investment in Noida and Greater Noida.',
        author: 'SKI Team',
        date: '2024-01-05',
        tags: ['Noida', 'Real Estate', 'Guide'],
    },
    {
        slug: 'residential-vs-commercial-land',
        title: 'Residential vs Commercial Land: Which is Better?',
        excerpt: 'Comparing the pros and cons of investing in residential plots versus commercial land to help you make an informed decision.',
        author: 'SKI Team',
        date: '2023-12-28',
        tags: ['Investment', 'Tips', 'Analysis'],
    },
];

export default function BlogPage() {
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
                        <span className="section-label">Insights & Articles</span>
                        <h1
                            className="text-4xl md:text-5xl font-bold mb-4"
                            style={{ fontFamily: 'var(--font-playfair)', color: '#F5F0EB' }}
                        >
                            Our <span style={{ color: 'var(--accent-copper)' }}>Blog</span>
                        </h1>
                        <div className="copper-line copper-line-center" />
                        <p className="text-lg max-w-xl mx-auto mt-6" style={{ color: '#C0B8AE' }}>
                            Expert insights on real estate trends, investment strategies, and market analysis.
                        </p>
                    </div>
                </section>

                {/* Blog Grid */}
                <section className="section-padding">
                    <div className="container-max">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {blogPosts.map((post, index) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="card group"
                                >
                                    {/* Image Placeholder */}
                                    <div
                                        className="h-52 flex items-center justify-center"
                                        style={{ background: 'linear-gradient(135deg, var(--bg-surface-alt), var(--border-subtle))' }}
                                    >
                                        <span className="text-5xl opacity-20">📝</span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.tags.map(tag => (
                                                <span
                                                    key={tag}
                                                    className="text-xs px-3 py-1 rounded-full"
                                                    style={{ background: 'var(--accent-copper-subtle)', color: 'var(--accent-copper)' }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <h3
                                            className="text-xl font-bold mb-2 group-hover:text-copper transition-colors"
                                            style={{ fontFamily: 'var(--font-playfair)' }}
                                        >
                                            {post.title}
                                        </h3>
                                        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                            <span>{post.author}</span>
                                            <span>{new Date(post.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                </Link>
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
