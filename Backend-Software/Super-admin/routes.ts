import { Router } from 'express';
import { db } from '../src/config/db.js';
import { tenants, users, branches } from '../../drizzle/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Initialize Supabase Client with Service Role Key if available, else anon key
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oeringgdbxmmihgvuyfa.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null;

// Get Platform Stats
router.get('/stats', async (req, res, next) => {
  try {
    const totalTenantsResult = await db.select({ count: sql<number>`count(*)` }).from(tenants);
    const totalBranchesResult = await db.select({ count: sql<number>`count(*)` }).from(branches);
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);

    res.json({
      success: true,
      stats: {
        totalTenants: totalTenantsResult[0]?.count || 0,
        totalBranches: totalBranchesResult[0]?.count || 0,
        totalUsers: totalUsersResult[0]?.count || 0,
        systemHealth: '99.99%',
      }
    });
  } catch (error) {
    next(error);
  }
});

// List all tenants
router.get('/tenants', async (req, res, next) => {
  try {
    const allTenants = await db.select().from(tenants);
    res.json({ success: true, tenants: allTenants });
  } catch (error) {
    next(error);
  }
});

// Create a new tenant (and default branch and tenant owner user)
router.post('/tenants', async (req, res, next) => {
  try {
    const { tenantName, subdomain, plan, ownerName, ownerEmail, ownerPassword } = req.body;

    if (!tenantName || !subdomain || !ownerEmail || !ownerPassword) {
       res.status(400).json({ success: false, error: 'Missing required parameters' });
       return;
    }

    // 1. Create Tenant
    const [newTenant] = await db.insert(tenants).values({
      name: tenantName,
      mode: 'SINGLE_STORE',
      maxSubaccounts: 50,
      status: 'ACTIVE',
    }).returning();

    if (!newTenant) {
      throw new Error('Failed to create tenant record');
    }

    // 2. Create Default Branch
    const [newBranch] = await db.insert(branches).values({
      tenantId: newTenant.id,
      name: `${tenantName} Main Branch`,
      status: 'ACTIVE',
    }).returning();

    if (!newBranch) {
      throw new Error('Failed to create branch record');
    }

    // 3. Create Auth User in Supabase (if service key is available)
    let authUserId: any = crypto.randomUUID(); // Fallback UUID
    let authCreated = false;

    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          full_name: ownerName || tenantName,
        }
      });

      if (authError) {
        // Rollback created DB records if auth creation failed
        await db.delete(branches).where(eq(branches.id, newBranch.id));
        await db.delete(tenants).where(eq(tenants.id, newTenant.id));
        res.status(500).json({ success: false, error: `Supabase Auth error: ${authError.message}` });
        return;
      }

      if (authData.user) {
        authUserId = authData.user.id;
        authCreated = true;
      }
    }

    // 4. Create User Record in Custom Users Table
    const [newUser] = await db.insert(users).values({
      id: authUserId,
      tenantId: newTenant.id,
      branchId: newBranch.id,
      fullName: ownerName || tenantName,
      email: ownerEmail,
      role: 'owner',
      status: 'ACTIVE',
    }).returning();

    res.json({
      success: true,
      message: 'Tenant account created successfully',
      tenant: {
        ...newTenant,
        subdomain, // include subdomain dynamically for response
        plan
      },
      branch: newBranch,
      user: newUser,
      authCreated
    });
  } catch (error) {
    next(error);
  }
});

// Update tenant status
router.patch('/tenants/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
       res.status(400).json({ success: false, error: 'Invalid status parameter' });
       return;
    }

    const [updatedTenant] = await db.update(tenants)
      .set({ status })
      .where(eq(tenants.id, id))
      .returning();

    if (!updatedTenant) {
       res.status(404).json({ success: false, error: 'Tenant not found' });
       return;
    }

    res.json({ success: true, tenant: updatedTenant });
  } catch (error) {
    next(error);
  }
});

// GET all branches and staff under a tenant
router.get('/tenants/:tenantId/details', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const tenantBranches = await db.select().from(branches).where(eq(branches.tenantId, tenantId));
    const tenantStaff = await db.select().from(users).where(eq(users.tenantId, tenantId));
    res.json({
      success: true,
      branches: tenantBranches,
      staff: tenantStaff
    });
  } catch (error) {
    next(error);
  }
});

// CREATE a staff account under a tenant (limit up to 50 staff per tenant)
router.post('/tenants/:tenantId/staff', async (req, res, next) => {
  try {
    const { tenantId } = req.params;
    const { name, email, password, role, branchId } = req.body;

    if (!name || !email || !password || !role || !branchId) {
      res.status(400).json({ success: false, error: 'Missing required staff details' });
      return;
    }

    // Enforce 50 staff limit
    const existingStaffResult = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.tenantId, tenantId));
    
    const staffCount = existingStaffResult[0]?.count || 0;
    if (staffCount >= 50) {
      res.status(400).json({ success: false, error: 'Staff limit reached. A maximum of 50 staff IDs are allowed per tenant.' });
      return;
    }

    // Create auth user in Supabase
    let authUserId: any = crypto.randomUUID();
    let authCreated = false;

    if (supabase) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
        }
      });

      if (authError) {
        res.status(500).json({ success: false, error: `Supabase Auth error: ${authError.message}` });
        return;
      }

      if (authData.user) {
        authUserId = authData.user.id;
        authCreated = true;
      }
    }

    // Insert user record
    const [newUser] = await db.insert(users).values({
      id: authUserId,
      tenantId,
      branchId,
      fullName: name,
      email,
      role,
      status: 'ACTIVE',
    }).returning();

    res.json({
      success: true,
      message: 'Staff user created successfully',
      user: newUser,
      authCreated
    });
  } catch (error) {
    next(error);
  }
});

// Delete/Deactivate staff member
router.delete('/staff/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Delete custom record
    await db.delete(users).where(eq(users.id, userId));

    // Delete in Supabase Auth if available
    if (supabase) {
      await supabase.auth.admin.deleteUser(userId);
    }

    res.json({ success: true, message: 'Staff user deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
