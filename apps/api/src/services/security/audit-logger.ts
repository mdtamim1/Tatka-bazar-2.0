import { prisma } from "@tatka-bazar/database";

// ============================================================
// Tatka Bazar — Immutable Audit Trail Engine
// Non-repudiation and security logging for all critical operations
// ============================================================

export interface AuditLogParams {
  adminUserId?: string | undefined;
  riderId?: string | undefined;
  actorRole?: "RIDER" | "ADMIN" | "HUB" | "SYSTEM" | "VENDOR" | "CUSTOMER" | undefined;
  action: string;
  entity: string;
  entityId?: string | undefined;
  oldValues?: any | undefined;
  newValues?: any | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

/**
 * Creates an immutable audit record in PostgreSQL
 */
export async function createAuditRecord(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        adminUserId: params.adminUserId || null,
        riderId: params.riderId || null,
        actorRole: params.actorRole || "SYSTEM",
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
        oldValues: params.oldValues ? JSON.parse(JSON.stringify(params.oldValues)) : undefined,
        newValues: params.newValues ? JSON.parse(JSON.stringify(params.newValues)) : undefined,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent ? params.userAgent.substring(0, 500) : null,
      },
    });
  } catch (err: any) {
    // Non-blocking: log warning to console if audit write encounters issues
    console.warn("[AuditLogger] Failed to persist audit record:", err.message);
  }
}
