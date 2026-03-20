const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── Core API helper (Bearer token auth for cross-domain) ──

function getAuthHeaders(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem('ski-token');
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
    if (!res.ok) {
        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('ski-logout'));
            }
        }
        // Attach all response fields (e.g. unverified, email) to the error object
        // so callers can detect special cases like unverified email
        const err: any = new Error(data.message || 'Request failed');
        Object.assign(err, data);
        throw err;
    }
    return data;
}

// ─── AUTH ────────────────────────────────────────────────

export const userLogin = async (email: string, password: string) =>
    apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, role: 'user' }) });

export const userSignup = async (data: { name: string; email: string; phone: string; password: string; referralCode?: string }) =>
    apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) });

export const verifyEmailOTP = async (email: string, otp: string) =>
    apiCall('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, otp }) });

export const resendVerification = async (email: string) =>
    apiCall('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });

export const requestPasswordReset = async (email: string) =>
    apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string) =>
    apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });

// ─── DASHBOARD ───────────────────────────────────────────

export const getUserDashboard = async () => apiCall('/user/dashboard');

// ─── MY TEAM ─────────────────────────────────────────────

export const getMyTeam = async () => apiCall('/user/team');

// ─── INVESTMENTS ─────────────────────────────────────────

export const getUserInvestments = async () => apiCall('/user/investments');

export const getUserPropertyDeals = async () => apiCall('/user/property-deals');

export const createUserInvestment = async (data: any) =>
    apiCall('/user/investments', { method: 'POST', body: JSON.stringify(data) });

// ─── SUPPORT ─────────────────────────────────────────────

export const getUserTickets = async () => apiCall('/user/support');

export const createUserTicket = async (data: { subject: string; message: string }) =>
    apiCall('/user/support', { method: 'POST', body: JSON.stringify(data) });

export const replyToUserTicket = async (id: string, message: string) =>
    apiCall(`/user/support/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) });

export const markTicketSeenByUser = async (id: string) =>
    apiCall(`/user/support/${id}/seen`, { method: 'PUT' });

// ─── PROFIT ──────────────────────────────────────────────

export const getSelfReward = async () => apiCall('/user/profit/self-reward');

export const getTeamBonusProfit = async () => apiCall('/user/profit/team-bonus');

export const getDirectBonusProfit = async () => apiCall('/user/profit/direct-bonus');

// ─── PROFILE ─────────────────────────────────────────────

export const getUserProfile = async () => apiCall('/user/profile');

export const updateUserProfile = async (data: any) =>
    apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(data) });

export const changeUserPassword = async (data: { currentPassword: string; newPassword: string }) =>
    apiCall('/user/profile/password', { method: 'PUT', body: JSON.stringify(data) });

export const updateBankDetails = async (data: any) =>
    apiCall('/user/profile/bank', { method: 'PUT', body: JSON.stringify(data) });

// ─── NOTIFICATIONS ───────────────────────────────────────

export const getUserNotifications = async (page = 1, limit = 20) =>
    apiCall(`/user/notifications?page=${page}&limit=${limit}`);

export const markUserNotificationsRead = async () =>
    apiCall('/user/notifications/read', { method: 'PUT' });

export const markUserNotificationRead = async (id: string) =>
    apiCall(`/user/notifications/${id}/read`, { method: 'PUT' });
