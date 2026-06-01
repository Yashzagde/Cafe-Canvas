import 'dart:typed_data';
import '../models/models.dart';
import '../supabase/supabase_service.dart';

class MenuRepository {
  final _client = SupabaseService.instance.client;

  // --- Category CRUD Operations ---

  Future<List<MenuCategory>> fetchCategories(String branchId) async {
    final response = await _client
        .from('menu_categories')
        .select()
        .eq('branch_id', branchId)
        .isFilter('deleted_at', 'null')
        .order('sort_order', ascending: true);

    return (response as List).map((c) => MenuCategory.fromJson(c)).toList();
  }

  Future<MenuCategory> createCategory(Map<String, dynamic> data) async {
    final response = await _client
        .from('menu_categories')
        .insert(data)
        .select()
        .single();
    return MenuCategory.fromJson(response);
  }

  Future<MenuCategory> updateCategory(String id, Map<String, dynamic> data) async {
    final response = await _client
        .from('menu_categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    return MenuCategory.fromJson(response);
  }

  Future<void> deleteCategory(String id) async {
    await _client
        .from('menu_categories')
        .update({'deleted_at': DateTime.now().toIso8601String()})
        .eq('id', id);
  }

  // --- MenuItem CRUD Operations ---

  Future<List<MenuItem>> fetchItems(String branchId, {String? categoryId}) async {
    var query = _client.from('menu_items').select().eq('branch_id', branchId).isFilter('deleted_at', 'null');
    
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    
    final response = await query.order('name', ascending: true);
    return (response as List).map((i) => MenuItem.fromJson(i)).toList();
  }

  Future<MenuItem> createItem(Map<String, dynamic> data) async {
    final response = await _client
        .from('menu_items')
        .insert(data)
        .select()
        .single();
    return MenuItem.fromJson(response);
  }

  Future<MenuItem> updateItem(String id, Map<String, dynamic> data) async {
    final response = await _client
        .from('menu_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
    return MenuItem.fromJson(response);
  }

  Future<void> deleteItem(String id) async {
    await _client
        .from('menu_items')
        .update({'deleted_at': DateTime.now().toIso8601String()})
        .eq('id', id);
  }

  // --- Modifier CRUD Operations ---

  Future<List<ModifierGroup>> fetchModifiersForItem(String itemId) async {
    final List<dynamic> groupsRes = await _client
        .from('modifier_groups')
        .select()
        .eq('item_id', itemId);

    final List<ModifierGroup> groups = [];
    for (final g in groupsRes) {
      final List<dynamic> optionsRes = await _client
          .from('modifier_options')
          .select()
          .eq('group_id', g['id']);
      
      final options = optionsRes.map((o) => ModifierOption.fromJson(o)).toList();
      groups.add(ModifierGroup.fromJson(g, options));
    }
    return groups;
  }

  // --- Image Upload Operations ---

  Future<String> uploadMenuImage(String tenantId, String itemId, Uint8List imageBytes) async {
    final path = '$tenantId/$itemId.webp';
    await _client.storage.from('menu-images').uploadBinary(
      path,
      imageBytes,
      fileOptions: const FileOptions(
        upsert: true, 
        contentType: 'image/webp',
      ),
    );
    return _client.storage.from('menu-images').getPublicUrl(path);
  }
}
