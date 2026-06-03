import '../models/user_profile.dart';
import '../models/attendance.dart';
import '../models/staff_call.dart';
import '../services/supabase_service.dart';

/// Repository for staff management and attendance.
class StaffRepository {
  StaffRepository._();

  static Future<List<UserProfile>> getStaff(String tenantId, {String? branchId}) async {
    var query = SupabaseService.from('users')
        .select()
        .eq('tenant_id', tenantId);
    if (branchId != null) query = query.eq('branch_id', branchId);
    final data = await query.order('name');
    return (data as List).map((e) => UserProfile.fromJson(e)).toList();
  }

  static Future<void> updateStaff(String id, Map<String, dynamic> updates) async {
    await SupabaseService.from('users').update(updates).eq('id', id);
  }

  static Future<void> toggleActive(String id, bool active) async {
    await SupabaseService.from('users').update({'active': active}).eq('id', id);
  }

  static Future<void> setPin(String id, String pinHash) async {
    await SupabaseService.from('users').update({'pin_hash': pinHash}).eq('id', id);
  }

  // ─── ATTENDANCE ───

  static Future<List<Attendance>> getAttendance(String tenantId, {String? userId, String? date}) async {
    var query = SupabaseService.from('attendance')
        .select()
        .eq('tenant_id', tenantId);
    if (userId != null) query = query.eq('user_id', userId);
    if (date != null) query = query.eq('date', date);
    final data = await query.order('check_in_at', ascending: false);
    return (data as List).map((e) => Attendance.fromJson(e)).toList();
  }

  static Future<void> checkIn(String tenantId, String userId, String branchId) async {
    await SupabaseService.from('attendance').insert({
      'tenant_id': tenantId,
      'user_id': userId,
      'branch_id': branchId,
    });
  }

  static Future<void> checkOut(String attendanceId) async {
    await SupabaseService.from('attendance').update({
      'check_out_at': DateTime.now().toUtc().toIso8601String(),
    }).eq('id', attendanceId);
  }

  // ─── STAFF CALLS ───

  static Future<List<StaffCall>> getPendingCalls(String tenantId) async {
    final data = await SupabaseService.from('staff_calls')
        .select()
        .eq('tenant_id', tenantId)
        .eq('status', 'pending')
        .order('called_at', ascending: false);
    return (data as List).map((e) => StaffCall.fromJson(e)).toList();
  }

  static Future<void> attendCall(String callId, String userId) async {
    await SupabaseService.from('staff_calls').update({
      'status': 'attended',
      'attended_at': DateTime.now().toUtc().toIso8601String(),
      'attended_by': userId,
    }).eq('id', callId);
  }
}
