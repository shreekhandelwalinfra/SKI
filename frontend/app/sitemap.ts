import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE_URL}/properties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
        { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
        { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
    ];

    // Dynamic property pages
    let propertyPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/properties?limit=100`);
        const data = await res.json();
        if (data.data) {
            propertyPages = data.data.map((property: { slug: string; updatedAt: string }) => ({
                url: `${BASE_URL}/properties/${property.slug}`,
                lastModified: new Date(property.updatedAt),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));
        }
    } catch {
        // API not available during build
    }

    // Dynamic blog pages
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/blog?limit=100`);
        const data = await res.json();
        if (data.data) {
            blogPages = data.data.map((blog: { slug: string; updatedAt: string }) => ({
                url: `${BASE_URL}/blog/${blog.slug}`,
                lastModified: new Date(blog.updatedAt),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch {
        // API not available during build
    }

    return [...staticPages, ...propertyPages, ...blogPages];
}
