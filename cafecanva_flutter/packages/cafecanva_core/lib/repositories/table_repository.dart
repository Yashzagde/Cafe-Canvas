import '../models/models.dart';
import '../supabase/supabase_service.dart';

class TableRepository {
  final _client = SupabaseService.instance.client;

  Future<List<TableModel>> fetchTables(String branchId) async {
    final response = await _client
        .from('tables')
        .select()
        .eq('branch_id', branchId)
        .isFilter('deleted_at', 'null')
        .order('name', ascending: true);

    return (response as List).map((t) => TableModel.fromJson(t)).toList();
  }

  Future<TableModel> createTable(Map<String, dynamic> data) async {
    final response = await _client
        .from('tables')
        .insert(data)
        .select()
        .single();
    return TableModel.fromJson(response);
  }

  Future<TableModel> updateTable(String id, Map<String, dynamic> data) async {
    final response = await _client
        .from('tables')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    return TableModel.fromJson(response);
  }

  Future<void> updateTableStatus(String id, String status) async {
    await _client.from('tables').update({'status': status}).eq('id', id);
  }

  Future<void> deleteTable(String id) async {
    await _client
        .from('tables')
        .update({'deleted_at': DateTime.now().toIso8601String()})
        .eq('id', id);
  }
}
