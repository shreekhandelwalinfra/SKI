const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Core API helper (Bearer token auth for cross-domain) ──

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('ski-admin-token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiCall(path: string, options: RequestInit = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// ─── AUTH ────────────────────────────────────────────────

export const adminLogin = async (email: string, password: string) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role: 'admin' }) });

// ─── DASHBOARD ───────────────────────────────────────────

export const getDashboardStats = async () => apiCall('/admin/dashboard');

// ─── USERS ───────────────────────────────────────────────

export const getUsers = async (params?: string) =>
    apiCall(`/admin/users${params ? `?${params}` : ''}`);

export const addUser = async (data: any) =>
    apiCall('/admin/users', { method: 'POST', body: JSON.stringify(data) });

export const activateUser = async (id: string) =>
    apiCall(`/admin/users/${id}/activate`, { method: 'PUT' });

export const blockUser = async (id: string) =>
    apiCall(`/admin/users/${id}/block`, { method: 'PUT' });

export const deleteUser = async (id: string) =>
    apiCall(`/admin/users/${id}`, { method: 'DELETE' });

export const getAdminUserTree = async (id: string) =>
    apiCall(`/admin/users/${id}/tree`);

export const updateUserBalances = async (id: string, data: any) =>
    apiCall(`/admin/users/${id}/balances`, { method: 'PUT', body: JSON.stringify(data) });

// ─── INVESTMENTS ─────────────────────────────────────────

export const getInvestments = async (params?: string) =>
    apiCall(`/admin/investments${params ? `?${params}` : ''}`);

export const updateInvestmentStatus = async (id: string, data: any) =>
    apiCall(`/admin/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) });

// ─── PROFIT ───────────────────────────────────────────────

export const getFirmProfit = async () => apiCall('/admin/profit/firm');

export const getTeamBonus = async () => apiCall('/admin/profit/team-bonus');

export const getUserIncome = async (params?: string) =>
    apiCall(`/admin/profit/user-income${params ? `?${params}` : ''}`);

// ─── SUPPORT ─────────────────────────────────────────────

export const getSupportTickets = async (params?: string) =>
    apiCall(`/admin/support${params ? `?${params}` : ''}`);

export const updateSupportTicket = async (id: string, data: any) =>
    apiCall(`/admin/support/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const markTicketSeen = async (id: string) =>
    apiCall(`/admin/support/${id}/seen`, { method: 'PUT' });

export const deleteSupportTicket = async (id: string) =>
    apiCall(`/admin/support/${id}`, { method: 'DELETE' });

export const deleteTicketMessage = async (id: string, messageIndex: number) =>
    apiCall(`/admin/support/${id}/message/${messageIndex}`, { method: 'DELETE' });

// ─── PASSWORD ────────────────────────────────────────────

export const changePassword = async (data: { currentPassword: string; newPassword: string }) =>
    apiCall('/admin/change-password', { method: 'PUT', body: JSON.stringify(data) });

// ─── SYSTEM CLEANUP ──────────────────────────────────────

export const cleanupData = async () =>
    apiCall('/admin/system/cleanup', { method: 'POST' });

// ─── NOTIFICATIONS ───────────────────────────────────────

export const getAdminNotifications = async (page = 1, limit = 20) =>
    apiCall(`/admin/notifications?page=${page}&limit=${limit}`);

export const markAdminNotificationsRead = async () =>
    apiCall('/admin/notifications/read', { method: 'PUT' });

export const markAdminNotificationRead = async (id: string) =>
    apiCall(`/admin/notifications/${id}/read`, { method: 'PUT' });

// ─── ADMIN AUDIT LOGS ────────────────────────────────────

export const getAdminLogs = async (page = 1, limit = 30, filters?: { action?: string }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.action) params.set('action', filters.action);
    return apiCall(`/admin/logs?${params.toString()}`);
};
