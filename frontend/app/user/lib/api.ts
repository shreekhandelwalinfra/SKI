const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const MOCK_MODE = false; // Set to true only when backend is unavailable

// ─── MOCK DATA ───────────────────────────────────────────

const mockUser = {
    id: 'u1', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 9876543210',
    uniqueId: 'SKI-00001', referralCode: 'SKIRAH123', status: 'active', rank: 3,
    selfReward: 45000, directBonus: 22000, teamBonus: 78000, totalBusiness: 1850000,
    selfInvestment: 500000, address: '12, MG Road', city: 'Mathura', state: 'Uttar Pradesh',
    pincode: '281001', panNumber: 'ABCDE1234F', aadharNumber: '1234 5678 9012',
    dateOfBirth: '1995-06-15', profileImage: '', createdAt: '2026-01-15T10:00:00Z',
    bankDetail: { accountHolder: 'Rahul Sharma', accountNumber: '12345678901234', ifscCode: 'SBIN0001234', bankName: 'State Bank of India', branchName: 'Mathura Main', upiId: 'rahul@sbi' },
};

const mockTeam = [
    { id: '2', name: 'Priya Patel', email: 'priya@example.com', uniqueId: 'SKI-00002', selfInvestment: 380000, status: 'ACTIVE', createdAt: '2026-01-18T10:00:00Z', level: 1, downlineCount: 2 },
    { id: '3', name: 'Amit Kumar', email: 'amit@example.com', uniqueId: 'SKI-00003', selfInvestment: 250000, status: 'ACTIVE', createdAt: '2026-02-01T10:00:00Z', level: 1, downlineCount: 0 },
    { id: '4', name: 'Sneha Gupta', email: 'sneha@example.com', uniqueId: 'SKI-00004', selfInvestment: 175000, status: 'PENDING', createdAt: '2026-02-10T10:00:00Z', level: 1, downlineCount: 1 },
    { id: '5', name: 'Vikram Singh', email: 'vikram@example.com', uniqueId: 'SKI-00005', selfInvestment: 620000, status: 'ACTIVE', createdAt: '2026-02-05T10:00:00Z', level: 2, downlineCount: 0 },
    { id: '6', name: 'Kavita Joshi', email: 'kavita@example.com', uniqueId: 'SKI-00006', selfInvestment: 420000, status: 'ACTIVE', createdAt: '2026-02-12T10:00:00Z', level: 2, downlineCount: 0 },
];

const mockInvestments = [
    { id: 'i1', name: 'Rahul Sharma', uniqueId: 'SKI-00001', amount: 300000, type: 'Residential Plot - Sector 150, Noida', transactionDate: '2026-01-20T10:00:00Z', transactionId: 'TXN-2026-0001', status: 'APPROVED', remarks: 'Verified', createdAt: '2026-01-20T10:00:00Z' },
    { id: 'i2', name: 'Rahul Sharma', uniqueId: 'SKI-00001', amount: 200000, type: 'Commercial Land - Dholera SIR', transactionDate: '2026-02-15T10:00:00Z', transactionId: 'TXN-2026-0002', status: 'PENDING', remarks: '', createdAt: '2026-02-15T10:00:00Z' },
];

const mockTickets = [
    { id: 's1', subject: 'Investment Return Query', message: 'What is the expected return timeline?', status: 'OPEN', adminReply: '', messages: [{ sender: 'user', text: 'What is the expected return timeline?', time: '2026-02-20T10:00:00Z' }], createdAt: '2026-02-20T10:00:00Z' },
    { id: 's2', subject: 'Referral Bonus Not Credited', message: 'I referred Priya but bonus not showing', status: 'IN_PROGRESS', adminReply: 'We are looking into this', messages: [{ sender: 'user', text: 'I referred Priya but bonus not showing', time: '2026-02-18T10:00:00Z' }, { sender: 'admin', text: 'We are looking into this. Will be resolved within 24 hours.', time: '2026-02-19T10:00:00Z' }], createdAt: '2026-02-18T10:00:00Z' },
];

const mockRankConfig = { rank: 3, teamBusinessMin: 2500000, teamBusinessMax: 5000000, commissionPct: 7, selfInvestment: 1000000, rewardName: 'Motorbike', rewardValue: 50000 };

const mockSelfRewardProfits = [
    { id: 'p1', type: 'SELF_REWARD', amount: 25000, remark: 'Rank 2 achievement', status: 'PAID', transactionId: 'SR-001', createdAt: '2026-01-25T10:00:00Z' },
    { id: 'p2', type: 'SELF_REWARD', amount: 20000, remark: 'Rank 3 achievement', status: 'APPROVED', transactionId: 'SR-002', createdAt: '2026-02-10T10:00:00Z' },
];

const mockTeamBonusProfits = [
    { id: 'p3', type: 'TEAM_BONUS', amount: 28500, fromUserName: 'Priya Patel', fromUserUniqueId: 'SKI-00002', fromUserRank: 2, differencePercentage: 2, remark: 'Team commission', status: 'PAID', transactionId: 'TB-001', createdAt: '2026-02-01T10:00:00Z' },
    { id: 'p4', type: 'TEAM_BONUS', amount: 18700, fromUserName: 'Vikram Singh', fromUserUniqueId: 'SKI-00005', fromUserRank: 1, differencePercentage: 4, remark: 'Level 2 bonus', status: 'APPROVED', transactionId: 'TB-002', createdAt: '2026-02-12T10:00:00Z' },
    { id: 'p5', type: 'TEAM_BONUS', amount: 12400, fromUserName: 'Kavita Joshi', fromUserUniqueId: 'SKI-00006', fromUserRank: 1, differencePercentage: 4, remark: 'Level 2 bonus', status: 'PENDING', transactionId: 'TB-003', createdAt: '2026-02-15T10:00:00Z' },
];

const mockDirectBonusProfits = [
    { id: 'p6', type: 'DIRECT_BONUS', amount: 9000, investmentAmount: 300000, brokerage: 3, commission: 9000, remark: 'Direct referral commission', status: 'PAID', transactionId: 'DB-001', createdAt: '2026-01-22T10:00:00Z' },
    { id: 'p7', type: 'DIRECT_BONUS', amount: 7000, investmentAmount: 200000, brokerage: 3.5, commission: 7000, remark: 'Amit Kumar investment', status: 'APPROVED', transactionId: 'DB-002', createdAt: '2026-02-05T10:00:00Z' },
];

function mockDelay<T>(data: T): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), 300));
}

// ─── REAL API ────────────────────────────────────────────

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user-token');
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

// ─── AUTH ────────────────────────────────────────────────

export const userLogin = async (email: string, password: string) => {
    if (MOCK_MODE) {
        if (email === 'rahul@example.com' && password === 'password123') {
            return mockDelay({ status: 'success', data: { ...mockUser, _id: mockUser.id, role: 'user', token: 'mock-user-token' } });
        }
        throw new Error('Invalid credentials');
    }
    return apiCall('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
};

export const userSignup = async (data: { name: string; email: string; phone: string; password: string; referralCode?: string }) => {
    if (MOCK_MODE) {
        return mockDelay({ status: 'success', data: { _id: 'new-user', name: data.name, email: data.email, role: 'user', uniqueId: 'SKI-00009', referralCode: 'SKINEW999', token: 'mock-user-token' } });
    }
    return apiCall('/auth/register', { method: 'POST', body: JSON.stringify(data) });
};

// ─── DASHBOARD ───────────────────────────────────────────

export const getUserDashboard = async () => {
    if (MOCK_MODE) {
        return mockDelay({
            status: 'success', data: {
                ...mockUser, referralLink: 'http://localhost:3000/user/signup?ref=SKIRAH123',
                teamSize: 5, rankConfig: mockRankConfig, totalIncome: mockUser.selfReward + mockUser.directBonus + mockUser.teamBonus,
            },
        });
    }
    return apiCall('/user/dashboard');
};

// ─── MY TEAM ─────────────────────────────────────────────

export const getMyTeam = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockTeam });
    return apiCall('/user/team');
};

// ─── INVESTMENTS ─────────────────────────────────────────

export const getUserInvestments = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockInvestments });
    return apiCall('/user/investments');
};

export const createUserInvestment = async (data: any) => {
    if (MOCK_MODE) {
        const inv = { id: `i${Date.now()}`, ...data, uniqueId: 'SKI-00001', transactionDate: new Date().toISOString(), transactionId: `TXN-${Date.now()}`, status: 'PENDING', remarks: '', createdAt: new Date().toISOString() };
        mockInvestments.unshift(inv);
        return mockDelay({ status: 'success', data: inv });
    }
    return apiCall('/user/investments', { method: 'POST', body: JSON.stringify(data) });
};

// ─── SUPPORT ─────────────────────────────────────────────

export const getUserTickets = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockTickets });
    return apiCall('/user/support');
};

export const createUserTicket = async (data: { subject: string; message: string }) => {
    if (MOCK_MODE) {
        const ticket = { id: `s${Date.now()}`, ...data, status: 'OPEN', adminReply: '', messages: [{ sender: 'user', text: data.message, time: new Date().toISOString() }], createdAt: new Date().toISOString() };
        mockTickets.unshift(ticket);
        return mockDelay({ status: 'success', data: ticket });
    }
    return apiCall('/user/support', { method: 'POST', body: JSON.stringify(data) });
};

export const replyToUserTicket = async (id: string, message: string) => {
    if (MOCK_MODE) {
        const ticket = mockTickets.find(t => t.id === id);
        if (ticket) ticket.messages.push({ sender: 'user', text: message, time: new Date().toISOString() });
        return mockDelay({ status: 'success', data: ticket });
    }
    return apiCall(`/user/support/${id}/reply`, { method: 'POST', body: JSON.stringify({ message }) });
};

// ─── PROFIT ──────────────────────────────────────────────

export const getSelfReward = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: { user: mockUser, rankConfig: mockRankConfig, profits: mockSelfRewardProfits } });
    return apiCall('/user/profit/self-reward');
};

export const getTeamBonusProfit = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockTeamBonusProfits });
    return apiCall('/user/profit/team-bonus');
};

export const getDirectBonusProfit = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockDirectBonusProfits });
    return apiCall('/user/profit/direct-bonus');
};

// ─── PROFILE ─────────────────────────────────────────────

export const getUserProfile = async () => {
    if (MOCK_MODE) return mockDelay({ status: 'success', data: mockUser });
    return apiCall('/user/profile');
};

export const updateUserProfile = async (data: any) => {
    if (MOCK_MODE) {
        Object.assign(mockUser, data);
        return mockDelay({ status: 'success', data: mockUser });
    }
    return apiCall('/user/profile', { method: 'PUT', body: JSON.stringify(data) });
};

export const changeUserPassword = async (data: { currentPassword: string; newPassword: string }) => {
    if (MOCK_MODE) {
        if (data.currentPassword !== 'password123') throw new Error('Current password is incorrect');
        return mockDelay({ status: 'success', message: 'Password changed successfully' });
    }
    return apiCall('/user/profile/password', { method: 'PUT', body: JSON.stringify(data) });
};

export const updateBankDetails = async (data: any) => {
    if (MOCK_MODE) {
        mockUser.bankDetail = { ...mockUser.bankDetail, ...data };
        return mockDelay({ status: 'success', data: mockUser.bankDetail });
    }
    return apiCall('/user/profile/bank', { method: 'PUT', body: JSON.stringify(data) });
};
