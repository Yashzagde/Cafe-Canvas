export interface TenantDto {
  id: string
  name: string
  subdomain: string
  plan: string
  status: string
  createdAt: string
  publicId?: string
}

export interface BranchDto {
  id: string
  tenantId: string
  name: string
  status: string
  createdAt: string
}

export interface StaffDto {
  id: string
  tenantId: string
  branchId: string
  fullName: string
  email: string
  role: string
  status: string
}

export function mapTenant(row: {
  id: string
  name: string
  subdomain: string
  plan: string | null
  active: boolean | null
  created_at: string
  public_id?: string
}): TenantDto {
  return {
    id: row.id,
    name: row.name,
    subdomain: row.subdomain,
    plan: row.plan ?? 'free',
    status: row.active === false ? 'SUSPENDED' : 'ACTIVE',
    createdAt: row.created_at,
    publicId: row.public_id ?? '',
  }
}

export function mapBranch(row: {
  id: string
  tenant_id: string
  name: string
  active: boolean | null
  created_at: string
}): BranchDto {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    status: row.active === false ? 'SUSPENDED' : 'ACTIVE',
    createdAt: row.created_at,
  }
}

export function mapStaff(row: {
  id: string
  tenant_id: string | null
  branch_id: string | null
  name: string
  email: string | null
  role: string | null
  active: boolean | null
}): StaffDto {
  return {
    id: row.id,
    tenantId: row.tenant_id ?? '',
    branchId: row.branch_id ?? '',
    fullName: row.name,
    email: row.email ?? '',
    role: row.role ?? 'staff',
    status: row.active === false ? 'SUSPENDED' : 'ACTIVE',
  }
}
