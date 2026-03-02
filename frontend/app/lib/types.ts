export interface PropertyImage {
    url: string;
    public_id: string;
    alt?: string;
}

export interface PropertyLocation {
    address: string;
    city: string;
    state: string;
    pincode: string;
    zone: string;
}

export interface PropertyContact {
    name: string;
    phone: string;
    email: string;
}

export type PropertyCategory =
    | 'residential-land'
    | 'commercial-land'
    | 'mvda-approved'
    | 'mathura-vrindavan'
    | 'noida-greater-noida-jewar';

export type ListingType = 'sale' | 'purchase';

export interface Property {
    _id: string;
    title: string;
    slug: string;
    category: PropertyCategory;
    listingType: ListingType;
    price: number;
    priceUnit: 'total' | 'per-sqft' | 'per-sqyd' | 'per-acre';
    area: number;
    areaUnit: 'sqft' | 'sqyd' | 'acre' | 'bigha';
    location: PropertyLocation;
    description: string;
    highlights: string[];
    amenities: string[];
    images: PropertyImage[];
    isFeatured: boolean;
    isActive: boolean;
    isMVDAApproved: boolean;
    possession: string;
    facing: string;
    roadWidth: string;
    contactPerson: PropertyContact;
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface Blog {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: { url: string; public_id: string };
    author: string;
    tags: string[];
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Inquiry {
    _id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    propertyId?: string;
    propertyTitle?: string;
    status: 'new' | 'contacted' | 'closed';
    createdAt: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    token?: string;
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    pages: number;
}

export interface ApiResponse<T> {
    status: 'success' | 'error';
    data?: T;
    message?: string;
    pagination?: PaginationData;
}

export const CATEGORY_LABELS: Record<PropertyCategory, string> = {
    'residential-land': 'Residential Lands',
    'commercial-land': 'Commercial Lands',
    'mvda-approved': 'MVDA Approved Projects',
    'mathura-vrindavan': 'Mathura - Vrindavan',
    'noida-greater-noida-jewar': 'Noida - Greater Noida - Jewar',
};

export const LOCATIONS = [
    'Noida',
    'Greater Noida',
    'Jewar',
    'Delhi NCR',
    'Mathura',
    'Vrindavan',
];

export const formatPrice = (price: number): string => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} Lac`;
    return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (area: number, unit: string): string => {
    return `${area.toLocaleString('en-IN')} ${unit}`;
};
