export interface Tenant {
  id:                string
  name:              string
  slug:              string
  email:             string
  phone?:            string
  address?:          string
  city?:             string
  state?:            string
  pincode?:          string
  logo_url?:         string
  subscription_tier: 'Free' | 'Pro' | 'Growth' | 'Enterprise'
  is_active:         boolean
  created_at:        string
}

export interface StaffAccount {
  id:           string
  tenant_id:    string
  auth_user_id?: string
  full_name:    string
  email:        string
  phone?:       string
  role:         'manager' | 'cashier' | 'kitchen' | 'delivery' | 'staff'
  pin?:         string
  location_id?: string
  is_active:    boolean
  last_login?:  string
  created_at:   string
}

export interface Location {
  id:         string
  tenant_id:  string
  name:       string
  address?:   string
  city?:      string
  state?:     string
  pincode?:   string
  phone?:     string
  is_active:  boolean
}

export interface StoreSettings {
  id:               string
  tenant_id:        string
  currency:         string
  tax_cgst:         number
  tax_sgst:         number
  tax_inclusive:    boolean
  razorpay_key_id?: string
  upi_id?:          string
  open_time?:       string
  close_time?:      string
}

export type RoleBadgeVariant = StaffAccount['role']
export type SubscriptionTier = Tenant['subscription_tier']
