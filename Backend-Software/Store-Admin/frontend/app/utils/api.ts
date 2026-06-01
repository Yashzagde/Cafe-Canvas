/**
 * CafeCanvas — Express API Client for Store Admin
 *
 * Handles authenticated requests to the Express backend
 * for complex mutations (billing, discount creation, etc.).
 * Simple reads go directly through Supabase client.
 */

const API_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000')
    : 'http://localhost:5000';

// The demo tenant/branch IDs from the seed data
const DEMO_TENANT_ID = 'a0000000-0000-0000-0000-000000000001';
const DEMO_BRANCH_ID = 'ab000000-0000-0000-0000-000000000001';
const DEMO_ROLE = 'TENANT_OWNER';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  tenantId?: string;
  branchId?: string;
  role?: string;
}

/**
 * Make an authenticated request to the Express backend.
 * Uses dev headers (x-tenant-id, x-branch-id, x-role) for local development.
 * In production, this should use the Supabase JWT Bearer token instead.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  const {
    method = 'GET',
    body,
    tenantId = DEMO_TENANT_ID,
    branchId = DEMO_BRANCH_ID,
    role = DEMO_ROLE,
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
    'x-branch-id': branchId,
    'x-role': role,
  };

  // If user has a Supabase JWT, use that instead of dev headers
  if (typeof window !== 'undefined') {
    const storedSession = localStorage.getItem('supabase-auth-token');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
          // Remove dev headers when using real auth
          delete headers['x-tenant-id'];
          delete headers['x-branch-id'];
          delete headers['x-role'];
        }
      } catch {
        // Ignore parsing errors, fall back to dev headers
      }
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.error?.message || json.error || `HTTP ${response.status}`,
      };
    }

    return { success: true, data: json.data ?? json };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error(`[API] ${method} ${endpoint} failed:`, message);
    return { success: false, error: message };
  }
}
