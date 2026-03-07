const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ─── MOCK DATA (used when backend is unavailable) ────────
const MOCK_MODE = false; // Set to true only when backend is unavailable

const mockDashboard = {
    totalUsers: 1247,
    activeUsers: 893,
    pendingUsers: 184,
    todayRegistrations: 23,
    todayActivations: 15,
    totalBusiness: 45670000,
    totalSelfReward: 1230000,
    totalDirectBonus: 890000,
    totalTeamBonus: 2340000,
};

const mockUsers = [
    { _id: '1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210', uniqueId: 'SKI-00001', status: 'active', isBlocked: false, selfReward: 25000, directBonus: 12000, teamBonus: 45000, totalBusiness: 500000, referredBy: null, teamLeadId: null, createdAt: '2026-01-15T10:00:00Z', activatedAt: '2026-01-16T10:00:00Z' },
    { _id: '2', name: 'Priya Patel', email: 'priya@example.com', phone: '+91 9876543211', uniqueId: 'SKI-00002', status: 'active', isBlocked: false, selfReward: 18000, directBonus: 9500, teamBonus: 32000, totalBusiness: 380000, referredBy: null, teamLeadId: { _id: '1', name: 'Rahul Sharma', uniqueId: 'SKI-00001' }, createdAt: '2026-01-18T10:00:00Z', activatedAt: '2026-01-19T10:00:00Z' },
    { _id: '3', name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 9876543212', uniqueId: 'SKI-00003', status: 'pending', isBlocked: false, selfReward: 0, directBonus: 0, teamBonus: 0, totalBusiness: 0, referredBy: null, teamLeadId: null, createdAt: '2026-02-20T10:00:00Z', activatedAt: null },
    { _id: '4', name: 'Sneha Gupta', email: 'sneha@example.com', phone: '+91 9876543213', uniqueId: 'SKI-00004', status: 'pending', isBlocked: false, selfReward: 0, directBonus: 0, teamBonus: 0, totalBusiness: 0, referredBy: null, teamLeadId: null, createdAt: '2026-02-21T10:00:00Z', activatedAt: null },
    { _id: '5', name: 'Vikram Singh', email: 'vikram@example.com', phone: '+91 9876543214', uniqueId: 'SKI-00005', status: 'active', isBlocked: false, selfReward: 31000, directBonus: 15000, teamBonus: 55000, totalBusiness: 620000, referredBy: null, teamLeadId: { _id: '1', name: 'Rahul Sharma', uniqueId: 'SKI-00001' }, createdAt: '2026-01-22T10:00:00Z', activatedAt: '2026-01-23T10:00:00Z' },
    { _id: '6', name: 'Neha Verma', email: 'neha@example.com', phone: '+91 9876543215', uniqueId: 'SKI-00006', status: 'active', isBlocked: true, selfReward: 5000, directBonus: 2000, teamBonus: 8000, totalBusiness: 90000, referredBy: null, teamLeadId: null, createdAt: '2026-02-01T10:00:00Z', activatedAt: '2026-02-02T10:00:00Z' },
    { _id: '7', name: 'Arjun Reddy', email: 'arjun@example.com', phone: '+91 9876543216', uniqueId: 'SKI-00007', status: 'pending', isBlocked: false, selfReward: 0, directBonus: 0, teamBonus: 0, totalBusiness: 0, referredBy: null, teamLeadId: null, createdAt: '2026-02-22T10:00:00Z', activatedAt: null },
    { _id: '8', name: 'Kavita Joshi', email: 'kavita@example.com', phone: '+91 9876543217', uniqueId: 'SKI-00008', status: 'active', isBlocked: false, selfReward: 22000, directBonus: 11000, teamBonus: 38000, totalBusiness: 420000, referredBy: null, teamLeadId: { _id: '5', name: 'Vikram Singh', uniqueId: 'SKI-00005' }, createdAt: '2026-02-05T10:00:00Z', activatedAt: '2026-02-06T10:00:00Z' },
];

const mockInvestments = [
    { _id: 'i1', userId: { name: 'Rahul Sharma', uniqueId: 'SKI-00001', email: 'rahul@example.com' }, name: 'Rahul Sharma', uniqueId: 'SKI-00001', amount: 500000, transactionDate: '2026-01-20T10:00:00Z', transactionId: 'TXN-2026-0001', status: 'approved' },
    { _id: 'i2', userId: { name: 'Priya Patel', uniqueId: 'SKI-00002', email: 'priya@example.com' }, name: 'Priya Patel', uniqueId: 'SKI-00002', amount: 380000, transactionDate: '2026-01-25T10:00:00Z', transactionId: 'TXN-2026-0002', status: 'approved' },
    { _id: 'i3', userId: { name: 'Vikram Singh', uniqueId: 'SKI-00005', email: 'vikram@example.com' }, name: 'Vikram Singh', uniqueId: 'SKI-00005', amount: 620000, transactionDate: '2026-02-01T10:00:00Z', transactionId: 'TXN-2026-0003', status: 'approved' },
    { _id: 'i4', userId: { name: 'Amit Kumar', uniqueId: 'SKI-00003', email: 'amit@example.com' }, name: 'Amit Kumar', uniqueId: 'SKI-00003', amount: 250000, transactionDate: '2026-02-20T10:00:00Z', transactionId: 'TXN-2026-0004', status: 'pending' },
    { _id: 'i5', userId: { name: 'Sneha Gupta', uniqueId: 'SKI-00004', email: 'sneha@example.com' }, name: 'Sneha Gupta', uniqueId: 'SKI-00004', amount: 175000, transactionDate: '2026-02-21T10:00:00Z', transactionId: 'TXN-2026-0005', status: 'pending' },
    { _id: 'i6', userId: { name: 'Kavita Joshi', uniqueId: 'SKI-00008', email: 'kavita@example.com' }, name: 'Kavita Joshi', uniqueId: 'SKI-00008', amount: 420000, transactionDate: '2026-02-10T10:00:00Z', transactionId: 'TXN-2026-0006', status: 'approved' },
    { _id: 'i7', userId: { name: 'Arjun Reddy', uniqueId: 'SKI-00007', email: 'arjun@example.com' }, name: 'Arjun Reddy', uniqueId: 'SKI-00007', amount: 300000, transactionDate: '2026-02-22T10:00:00Z', transactionId: 'TXN-2026-0007', status: 'rejected' },
];

const mockTeamBonus = [
    {
        teamLead: { _id: '1', name: 'Rahul Sharma', uniqueId: 'SKI-00001', teamBonus: 45000 },
        members: [
            { _id: '2', name: 'Priya Patel', uniqueId: 'SKI-00002', teamBonus: 32000, directBonus: 9500, selfReward: 18000, totalBusiness: 380000 },
            { _id: '5', name: 'Vikram Singh', uniqueId: 'SKI-00005', teamBonus: 55000, directBonus: 15000, selfReward: 31000, totalBusiness: 620000 },
        ],
    },
    {
        teamLead: { _id: '5', name: 'Vikram Singh', uniqueId: 'SKI-00005', teamBonus: 55000 },
        members: [
            { _id: '8', name: 'Kavita Joshi', uniqueId: 'SKI-00008', teamBonus: 38000, directBonus: 11000, selfReward: 22000, totalBusiness: 420000 },
        ],
    },
];

const mockFirmProfit = [
    { _id: 'fp1', userId: { name: 'SKI Firm', uniqueId: 'FIRM' }, amount: 1250000, description: 'Q4 2025 Land Sales Commission', createdAt: '2026-01-05T10:00:00Z' },
    { _id: 'fp2', userId: { name: 'SKI Firm', uniqueId: 'FIRM' }, amount: 870000, description: 'January 2026 Property Deals', createdAt: '2026-02-01T10:00:00Z' },
    { _id: 'fp3', userId: { name: 'SKI Firm', uniqueId: 'FIRM' }, amount: 540000, description: 'February 2026 Commercial Plots', createdAt: '2026-02-15T10:00:00Z' },
];

const mockSupportTickets = [
    { _id: 's1', userId: { name: 'Rahul Sharma', uniqueId: 'SKI-00001', email: 'rahul@example.com' }, name: 'Rahul Sharma', email: 'rahul@example.com', subject: 'Investment Return Query', message: 'I want to know about the expected returns on my plot investment in Sector 150. Can you share the projected timeline?', status: 'open', adminReply: '', createdAt: '2026-02-20T10:00:00Z' },
    { _id: 's2', userId: { name: 'Priya Patel', uniqueId: 'SKI-00002', email: 'priya@example.com' }, name: 'Priya Patel', email: 'priya@example.com', subject: 'Account Activation Delay', message: 'My account has been pending for 3 days. Please activate it as I have already submitted all documents.', status: 'inProgress', adminReply: 'We are verifying your documents. Will be done by tomorrow.', createdAt: '2026-02-18T10:00:00Z' },
    { _id: 's3', userId: { name: 'Vikram Singh', uniqueId: 'SKI-00005', email: 'vikram@example.com' }, name: 'Vikram Singh', email: 'vikram@example.com', subject: 'Team Bonus Calculation', message: 'The team bonus amount seems incorrect for this month. My team generated ₹6.2L in business but the bonus is lower than expected.', status: 'resolved', adminReply: 'The bonus was recalculated. The correct amount has been credited to your account.', createdAt: '2026-02-10T10:00:00Z' },
];

// ─── MOCK HELPERS ────────────────────────────────────────

function mockDelay<T>(data: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), 300));
}

// ─── REAL API CALL ───────────────────────────────────────

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('admin-token');
}

async function apiCall(path: string, options: RequestInit = {}) {
    const token = getToken();
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// ─── EXPORTED FUNCTIONS ──────────────────────────────────

// Auth
export const adminLogin = async (email: string, password: string) => {
    if (MOCK_MODE) {
        if (email === 'admin@ski.com' && password === 'admin123') {
            return mockDelay({ status: 'success', data: { _id: 'admin1', name: 'Admin', email: 'admin@ski.com', role: 'admin', token: 'mock-token-xyz' } });
        }
        throw new Error('Invalid credentials');
    }
    return apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
};

// Dashboard
export const getDashboardStats = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockDashboard });
    return apiCall('/admin/dashboard');
};

// Users
export const getUsers = async (params?: string) => {
    if (MOCK_MODE) {
        let filtered = [...mockUsers];
        if (params?.includes('status=pending')) filtered = filtered.filter(u => u.status === 'pending');
        else if (params?.includes('status=active')) filtered = filtered.filter(u => u.status === 'active');
        else if (params?.includes('status=blocked')) filtered = filtered.filter(u => u.isBlocked);
        if (params?.includes('search=')) {
            const search = decodeURIComponent(params.split('search=')[1]?.split('&')[0] || '').toLowerCase();
            if (search) filtered = filtered.filter(u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search) || u.uniqueId.toLowerCase().includes(search));
        }
        return mockDelay({ status: 'success', data: filtered, pagination: { page: 1, limit: 20, total: filtered.length, pages: 1 } });
    }
    return apiCall(`/admin/users${params ? `?${params}` : ''}`);
};

export const addUser = async (data: any) => {
    if (MOCK_MODE) {
        const newUser = { _id: `new-${Date.now()}`, ...data, uniqueId: `SKI-${String(mockUsers.length + 1).padStart(5, '0')}`, isBlocked: false, selfReward: 0, directBonus: 0, teamBonus: 0, totalBusiness: 0, createdAt: new Date().toISOString() };
        mockUsers.push(newUser);
        return mockDelay({ status: 'success', data: newUser });
    }
    return apiCall('/admin/users', { method: 'POST', body: JSON.stringify(data) });
};

export const activateUser = async (id: string) => {
    if (MOCK_MODE) {
        const user = mockUsers.find(u => u._id === id);
        if (user) { user.status = 'active'; user.activatedAt = new Date().toISOString(); }
        return mockDelay({ status: 'success', data: user });
    }
    return apiCall(`/admin/users/${id}/activate`, { method: 'PUT' });
};

export const blockUser = async (id: string) => {
    if (MOCK_MODE) {
        const user = mockUsers.find(u => u._id === id);
        if (user) { user.isBlocked = !user.isBlocked; user.status = user.isBlocked ? 'blocked' : 'active'; }
        return mockDelay({ status: 'success', data: user });
    }
    return apiCall(`/admin/users/${id}/block`, { method: 'PUT' });
};

export const deleteUser = async (id: string) => {
    if (MOCK_MODE) {
        const idx = mockUsers.findIndex(u => u._id === id);
        if (idx > -1) mockUsers.splice(idx, 1);
        return mockDelay({ status: 'success', message: 'User deleted' });
    }
    return apiCall(`/admin/users/${id}`, { method: 'DELETE' });
};

export const getAdminUserTree = async (id: string) => {
    return apiCall(`/admin/users/${id}/tree`);
};

export const updateUserBalances = async (id: string, data: any) => {
    return apiCall(`/admin/users/${id}/balances`, { method: 'PUT', body: JSON.stringify(data) });
};

// Investments
export const getInvestments = async (params?: string) => {
    if (MOCK_MODE) {
        let filtered = [...mockInvestments];
        if (params?.includes('status=')) {
            const status = params.split('status=')[1]?.split('&')[0];
            if (status) filtered = filtered.filter(i => i.status === status);
        }
        return mockDelay({ status: 'success', data: filtered, pagination: { page: 1, limit: 20, total: filtered.length, pages: 1 } });
    }
    return apiCall(`/admin/investments${params ? `?${params}` : ''}`);
};

export const updateInvestmentStatus = async (id: string, data: any) => {
    if (MOCK_MODE) {
        const inv = mockInvestments.find(i => i._id === id);
        if (inv) (inv as any).status = data.status;
        return mockDelay({ status: 'success', data: inv });
    }
    return apiCall(`/admin/investments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

// Profit
export const getFirmProfit = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockFirmProfit });
    return apiCall('/admin/profit/firm');
};

export const getTeamBonus = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockTeamBonus });
    return apiCall('/admin/profit/team-bonus');
};

export const getUserIncome = async (params?: string) => {
    if (MOCK_MODE) {
        const data = mockUsers.filter(u => u.status === 'active').map(u => ({
            _id: u._id, name: u.name, uniqueId: u.uniqueId, selfReward: u.selfReward, directBonus: u.directBonus, teamBonus: u.teamBonus, totalIncome: u.selfReward + u.directBonus + u.teamBonus, totalBusiness: u.totalBusiness,
        }));
        return mockDelay({ status: 'success', data, pagination: { page: 1, limit: 20, total: data.length, pages: 1 } });
    }
    return apiCall(`/admin/profit/user-income${params ? `?${params}` : ''}`);
};

// Support
export const getSupportTickets = async (params?: string) => {
    if (MOCK_MODE) {
        let filtered = [...mockSupportTickets];
        if (params?.includes('status=')) {
            const status = params.split('status=')[1]?.split('&')[0];
            if (status) filtered = filtered.filter(t => t.status === status);
        }
        return mockDelay({ status: 'success', data: filtered });
    }
    return apiCall(`/admin/support${params ? `?${params}` : ''}`);
};

export const updateSupportTicket = async (id: string, data: any) => {
    if (MOCK_MODE) {
        const ticket = mockSupportTickets.find(t => t._id === id);
        if (ticket) { (ticket as any).status = data.status; (ticket as any).adminReply = data.adminReply || ''; }
        return mockDelay({ status: 'success', data: ticket });
    }
    return apiCall(`/admin/support/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};

export const markTicketSeen = async (id: string) => {
    return apiCall(`/admin/support/${id}/seen`, { method: 'PUT' });
};

export const deleteSupportTicket = async (id: string) => {
    return apiCall(`/admin/support/${id}`, { method: 'DELETE' });
};

export const deleteTicketMessage = async (id: string, messageIndex: number) => {
    return apiCall(`/admin/support/${id}/message/${messageIndex}`, { method: 'DELETE' });
};

// Password
export const changePassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (MOCK_MODE) {
        if (data.currentPassword !== 'admin123') throw new Error('Current password is incorrect');
        return mockDelay({ status: 'success', message: 'Password changed successfully' });
    }
    return apiCall('/admin/change-password', { method: 'PUT', body: JSON.stringify(data) });
};

// System Cleanup
export const cleanupData = async () => {
    if (MOCK_MODE) {
        return mockDelay({ status: 'success', message: 'System data partially cleaned (Mock)' });
    }
    return apiCall('/admin/system/cleanup', { method: 'POST' });
};
