import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  const { error: profileError } = await admin.from('users').delete().eq('id', id)
  if (profileError) {
    return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })
  }

  const { error: authError } = await admin.auth.admin.deleteUser(id)
  if (authError) {
    return NextResponse.json({ success: false, error: authError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
