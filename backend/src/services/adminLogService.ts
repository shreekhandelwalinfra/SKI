import prisma from '../config/database';

// ─── ADMIN AUDIT LOG SERVICE ─────────────────────────────
// Immutable ledger of all admin actions for accountability

interface LogActionParams {
    adminId: string;
    action: string;        // e.g. APPROVE_INVESTMENT, ACTIVATE_USER, EDIT_BALANCE
    targetId?: string;     // Affected user/investment/deal ID
    targetName?: string;   // Human-readable label
    details?: string;      // JSON payload of changes
    ipAddress?: string;
}

/**
 * Log an admin action to the audit trail.
 */
export async function logAdminAction(params: LogActionParams) {
    return prisma.adminLog.create({
        data: {
            adminId: params.adminId,
            action: params.action,
            targetId: params.targetId || null,
            targetName: params.targetName || null,
            details: params.details || '',
            ipAddress: params.ipAddress || null,
        },
    });
}

/**
 * Get admin logs (paginated, newest first).
 */
export async function getAdminLogs(page = 1, limit = 30, filters?: { action?: string; adminId?: string }) {
    const where: any = {};
    if (filters?.action) where.action = filters.action;
    if (filters?.adminId) where.adminId = filters.adminId;

    const [logs, total] = await Promise.all([
        prisma.adminLog.findMany({
            where,
            include: {
                admin: { select: { name: true, uniqueId: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.adminLog.count({ where }),
    ]);

    return { logs, total, page, limit, pages: Math.ceil(total / limit) };
}
