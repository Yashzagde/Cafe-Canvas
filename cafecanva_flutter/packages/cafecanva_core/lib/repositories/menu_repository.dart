import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/menu_category.dart';
import '../models/menu_item.dart';
import '../models/modifier_group.dart';
import '../services/supabase_service.dart';
import '../services/auth_service.dart';

/// Repository for menu categories, items, and modifiers.
class MenuRepository {
  MenuRepository._();
  MenuRepository();

  Future<List<MenuCategory>> fetchCategories(String branchId) {
    final tId = AuthService.tenantId ?? 'demo-tenant-5555';
    return getCategories(tId, branchId);
  }

  Future<List<MenuItem>> fetchItems(String branchId, {String? categoryId}) {
    final tId = AuthService.tenantId ?? 'demo-tenant-5555';
    return getItems(tId, branchId, categoryId: categoryId);
  }

  Future<List<ModifierGroup>> fetchModifiersForItem(String itemId) =>
      getModifierGroups(itemId);


  // ─── CATEGORIES ───

  static Future<List<MenuCategory>> getCategories(String tenantId, String branchId) async {
    final data = await SupabaseService.from('menu_categories')
        .select()
        .eq('tenant_id', tenantId)
        .isFilter('deleted_at', null)
        .order('sort_order');
    return (data as List).map((e) => MenuCategory.fromJson(e)).toList();
  }

  static Future<MenuCategory> createCategory(Map<String, dynamic> category) async {
    final data = await SupabaseService.from('menu_categories')
        .insert(category)
        .select()
        .single();
    return MenuCategory.fromJson(data);
  }

  static Future<void> updateCategory(String id, Map<String, dynamic> updates) async {
    await SupabaseService.from('menu_categories').update(updates).eq('id', id);
  }

  static Future<void> deleteCategory(String id) async {
    await SupabaseService.from('menu_categories')
        .update({'deleted_at': DateTime.now().toUtc().toIso8601String()})
        .eq('id', id);
  }

  // ─── MENU ITEMS ───

  static Future<List<MenuItem>> getItems(String tenantId, String branchId, {String? categoryId}) async {
    var query = SupabaseService.from('menu_items')
        .select()
        .eq('tenant_id', tenantId)
        .isFilter('deleted_at', null);
    if (categoryId != null) {
      query = query.eq('category_id', categoryId);
    }
    final data = await query.order('sort_order');
    return (data as List).map((e) => MenuItem.fromJson(e)).toList();
  }

  static Future<List<MenuItem>> getAvailableItems(String tenantId, String branchId) async {
    final data = await SupabaseService.from('menu_items')
        .select()
        .eq('tenant_id', tenantId)
        .eq('status', 'available')
        .isFilter('deleted_at', null)
        .order('sort_order');
    return (data as List).map((e) => MenuItem.fromJson(e)).toList();
  }

  static Future<MenuItem> createItem(Map<String, dynamic> item) async {
    final data = await SupabaseService.from('menu_items')
        .insert(item)
        .select()
        .single();
    return MenuItem.fromJson(data);
  }

  static Future<void> updateItem(String id, Map<String, dynamic> updates) async {
    updates['updated_at'] = DateTime.now().toUtc().toIso8601String();
    await SupabaseService.from('menu_items').update(updates).eq('id', id);
  }

  static Future<void> toggleItemStatus(String id, String newStatus) async {
    await SupabaseService.from('menu_items')
        .update({'status': newStatus, 'updated_at': DateTime.now().toUtc().toIso8601String()})
        .eq('id', id);
  }

  static Future<void> deleteItem(String id) async {
    await SupabaseService.from('menu_items')
        .update({'deleted_at': DateTime.now().toUtc().toIso8601String()})
        .eq('id', id);
  }

  // ─── MODIFIERS ───

  static Future<List<ModifierGroup>> getModifierGroups(String itemId) async {
    final groupsData = await SupabaseService.from('modifier_groups')
        .select()
        .eq('item_id', itemId);

    final groups = (groupsData as List).map((e) => ModifierGroup.fromJson(e)).toList();

    if (groups.isEmpty) return groups;

    final groupIds = groups.map((g) => g.id).toList();
    final optionsData = await SupabaseService.from('modifier_options')
        .select()
        .inFilter('group_id', groupIds);

    final options = (optionsData as List).map((e) => ModifierOption.fromJson(e)).toList();

    return groups.map((g) => g.copyWith(
      options: options.where((o) => o.groupId == g.id).toList(),
    )).toList();
  }

  static Future<ModifierGroup> createModifierGroup(Map<String, dynamic> group) async {
    final data = await SupabaseService.from('modifier_groups')
        .insert(group)
        .select()
        .single();
    return ModifierGroup.fromJson(data);
  }

  static Future<void> deleteModifierGroup(String groupId) async {
    await SupabaseService.from('modifier_groups').delete().eq('id', groupId);
  }

  static Future<ModifierOption> createModifierOption(Map<String, dynamic> option) async {
    final data = await SupabaseService.from('modifier_options')
        .insert(option)
        .select()
        .single();
    return ModifierOption.fromJson(data);
  }

  // ─── IMAGE UPLOAD ───

  static Future<String> uploadMenuImage(String tenantId, String itemId, List<int> imageBytes) async {
    final path = '$tenantId/menu/$itemId.jpg';
    await SupabaseService.storage.from('menu-images').uploadBinary(
      path,
      Uint8List.fromList(imageBytes),
      fileOptions: const FileOptions(contentType: 'image/jpeg', upsert: true),
    );
    return SupabaseService.storage.from('menu-images').getPublicUrl(path);
  }
}
