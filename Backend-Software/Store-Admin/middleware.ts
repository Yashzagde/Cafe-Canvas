import { Request, Response, NextFunction } from 'express';
import { db } from '../src/config/db.js';
import { sql } from 'drizzle-orm';

// Extend Express Request type definitions
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        tenant_id: string;
        branch_id: string | null;
        role: 'PLATFORM_ADMIN' | 'TENANT_OWNER' | 'BRANCH_ADMIN' | 'MANAGER' | 'STAFF' | 'KOS';
      };
      // Helper function to execute queries securely in a tenant transaction
      txQuery?: <T>(callback: (tx: any) => Promise<T>) => Promise<T>;
    }
  }
}

/**
 * Super Simple Base64URL JWT Decoder (No external library required)
 */
function decodeJWT(token: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8');
    return JSON.parse(payloadJson);
  } catch (err) {
    return null;
  }
}

/**
 * Middleware: Supabase Auth & Tenant RLS Scope Context passing
 */
export async function storeAdminAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // For easy local API developer verification, fallback to custom headers if no JWT is passed
      const devTenantId = req.headers['x-tenant-id'] as string;
      const devBranchId = req.headers['x-branch-id'] as string;
      const devRole = req.headers['x-role'] as string;
      const devUserId = req.headers['x-user-id'] as string;

      if (devTenantId && devRole) {
        req.user = {
          id: devUserId || '00000000-0000-0000-0000-000000000000',
          tenant_id: devTenantId,
          branch_id: devBranchId || null,
          role: devRole as any
        };
      } else {
        res.status(401).json({ success: false, error: 'Unauthorized: Missing Authorization Bearer Token or Dev Headers' });
        return;
      }
    } else {
      const token = authHeader.split(' ')[1];
      const payload = decodeJWT(token);

      if (!payload) {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid JWT token structure' });
        return;
      }

      // Supabase Auth stores claims in app_metadata (secure) or fallback to user_metadata
      const appMetadata = payload.app_metadata || {};
      const tenantId = appMetadata.tenant_id;
      const branchId = appMetadata.branch_id || null;
      const role = appMetadata.role;

      if (!tenantId || !role) {
        res.status(403).json({ success: false, error: 'Forbidden: Missing tenant_id or role in session claims' });
        return;
      }

      req.user = {
        id: payload.sub || '00000000-0000-0000-0000-000000000000',
        tenant_id: tenantId,
        branch_id: branchId,
        role: role
      };
    }

    // Role-based access control for Store Admin Panel
    const allowedRoles = ['TENANT_OWNER', 'BRANCH_ADMIN', 'MANAGER'];
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Forbidden: Insufficient privileges for Store Admin Panel' });
      return;
    }

    // Inject the Transaction Query Runner
    // All database calls inside this callback run securely inside a transaction scoped to this request's tenant
    const user = req.user;
    req.txQuery = async <T>(callback: (tx: any) => Promise<T>): Promise<T> => {
      return await db.transaction(async (tx) => {
        // Enforce Row Level Security by setting app variables for this local transaction
        await tx.execute(sql`SET LOCAL app.current_tenant_id = ${user.tenant_id}`);
        if (user.branch_id) {
          await tx.execute(sql`SET LOCAL app.current_branch_id = ${user.branch_id}`);
        }
        await tx.execute(sql`SET LOCAL app.current_role = ${user.role}`);
        
        return await callback(tx);
      });
    };

    next();
  } catch (err) {
    next(err);
  }
}
