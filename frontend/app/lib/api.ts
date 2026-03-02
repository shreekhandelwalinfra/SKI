const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: { 'Content-Type': 'application/json', ...options?.headers },
        ...options,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res.json();
}

// Properties
export const getProperties = (params?: string) =>
    fetchApi(`/properties${params ? `?${params}` : ''}`);

export const getPropertyBySlug = (slug: string) =>
    fetchApi(`/properties/${slug}`);

export const getFeaturedProperties = () =>
    fetchApi('/properties?isFeatured=true&limit=6');

export const getCategoryStats = () =>
    fetchApi('/properties/categories/stats');

// Blog
export const getBlogs = (params?: string) =>
    fetchApi(`/blog${params ? `?${params}` : ''}`);

export const getBlogBySlug = (slug: string) =>
    fetchApi(`/blog/${slug}`);

// Inquiries
export const submitInquiry = (data: Record<string, string>) =>
    fetchApi('/inquiries', { method: 'POST', body: JSON.stringify(data) });

// Auth
export const loginUser = (data: { email: string; password: string }) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const registerUser = (data: { name: string; email: string; password: string; phone: string }) =>
    fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const getMe = (token: string) =>
    fetchApi('/auth/me', { headers: { Authorization: `Bearer ${token}` } });

// Admin
export const createProperty = (data: Record<string, any>, token: string) =>
    fetchApi('/properties', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
    });

export const updateProperty = (id: string, data: Record<string, any>, token: string) =>
    fetchApi(`/properties/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { Authorization: `Bearer ${token}` },
    });

export const deleteProperty = (id: string, token: string) =>
    fetchApi(`/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });

export const getInquiries = (token: string, params?: string) =>
    fetchApi(`/inquiries${params ? `?${params}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
