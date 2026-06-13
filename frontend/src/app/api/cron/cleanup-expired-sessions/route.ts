import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Authorization
  const authHeader = req.headers.get('Authorization')
  const isCronAuthorized =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    process.env.NODE_ENV === 'development' // Allow bypass in development for testing

  if (!isCronAuthorized) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Initialize Admin client
  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json(
      { success: false, error: 'SUPABASE_SERVICE_ROLE_KEY not configured' },
      { status: 503 }
    )
  }

  try {
    // 3. Find and update expired table sessions (active for > 12 hours)
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()

    // Select active sessions that started more than 12 hours ago
    const { data: expiredSessions, error: selectError } = await admin
      .from('table_sessions')
      .select('id, table_id')
      .is('ended_at', null)
      .lt('started_at', twelveHoursAgo)

    if (selectError) {
      throw selectError
    }

    if (!expiredSessions || expiredSessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No expired sessions found.',
        count: 0
      })
    }

    const sessionIds = expiredSessions.map(s => s.id)
    const tableIds = expiredSessions.map(s => s.table_id).filter(Boolean)

    // Close the expired table sessions by setting ended_at to now
    const { error: updateSessionsError } = await admin
      .from('table_sessions')
      .update({ ended_at: new Date().toISOString() })
      .in('id', sessionIds)

    if (updateSessionsError) {
      throw updateSessionsError
    }

    // Reset the status of the associated tables back to 'vacant'
    if (tableIds.length > 0) {
      const { error: updateTablesError } = await admin
        .from('tables')
        .update({ status: 'vacant' })
        .in('id', tableIds)

      if (updateTablesError) {
        throw updateTablesError
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${expiredSessions.length} expired session(s).`,
      count: expiredSessions.length,
      sessionIds,
      tableIds
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
