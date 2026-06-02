import * as React from 'react'
import AdminLayout from '../../components/AdminLayout'

export const metadata = {
  title: 'Tenant Admin Dashboard | CafeCanvas',
  description: 'Manage menu, tables, billing, and analytics',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}
