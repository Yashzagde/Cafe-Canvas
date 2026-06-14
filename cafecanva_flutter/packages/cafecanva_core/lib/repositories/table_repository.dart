import '../models/table_model.dart';
import '../models/table_session.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';

/// Repository for table management and sessions.
class TableRepository {
  TableRepository._();
  TableRepository();

  Future<List<CafeTable>> fetchTables(String locationId) {
    final tId = AuthService.tenantId ?? 'demo-tenant-5555';
    return getTables(tId, locationId);
  }


  static Future<List<CafeTable>> getTables(String tenantId, String locationId) async {
    final data = await SupabaseService.from('tables')
        .select()
        .eq('tenant_id', tenantId)
        .eq('location_id', locationId)
        .isFilter('deleted_at', null)
        .order('name');
    return (data as List).map((e) => CafeTable.fromJson(e)).toList();
  }

  static Future<CafeTable> createTable(Map<String, dynamic> table) async {
    final data = await SupabaseService.from('tables')
        .insert(table)
        .select()
        .single();
    return CafeTable.fromJson(data);
  }

  static Future<void> updateTable(String id, Map<String, dynamic> updates) async {
    updates['updated_at'] = DateTime.now().toUtc().toIso8601String();
    await SupabaseService.from('tables').update(updates).eq('id', id);
  }

  static Future<void> updateTableStatus(String id, String status) async {
    await SupabaseService.from('tables')
        .update({'status': status, 'updated_at': DateTime.now().toUtc().toIso8601String()})
        .eq('id', id);
  }

  static Future<void> deleteTable(String id) async {
    await SupabaseService.from('tables')
        .update({'deleted_at': DateTime.now().toUtc().toIso8601String()})
        .eq('id', id);
  }

  // ─── SESSIONS ───

  static Future<TableSession> startSession(String tenantId, String tableId) async {
    final data = await SupabaseService.from('table_sessions')
        .insert({'tenant_id': tenantId, 'table_id': tableId})
        .select()
        .single();
    return TableSession.fromJson(data);
  }

  static Future<void> endSession(String tableId) async {
    await SupabaseService.from('table_sessions')
        .update({
          'check_out_at': DateTime.now().toUtc().toIso8601String(),
        })
        .eq('table_id', tableId)
        .isFilter('check_out_at', null);
  }
}
