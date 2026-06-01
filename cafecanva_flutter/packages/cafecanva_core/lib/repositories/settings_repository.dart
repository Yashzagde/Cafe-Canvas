import '../models/store_settings.dart';
import '../models/branding.dart';
import '../services/supabase_service.dart';

/// Repository for store settings and branding.
class SettingsRepository {
  SettingsRepository._();

  static Future<StoreSettings?> getStoreSettings(String tenantId, String branchId) async {
    final data = await SupabaseService.from('store_settings')
        .select()
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .maybeSingle();
    if (data == null) return null;
    return StoreSettings.fromJson(data);
  }

  static Future<void> updateStoreSettings(String id, Map<String, dynamic> updates) async {
    updates['updated_at'] = DateTime.now().toUtc().toIso8601String();
    await SupabaseService.from('store_settings').update(updates).eq('id', id);
  }

  static Future<Branding?> getBranding(String tenantId, String branchId) async {
    final data = await SupabaseService.from('branding')
        .select()
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .maybeSingle();
    if (data == null) return null;
    return Branding.fromJson(data);
  }

  static Future<void> updateBranding(String id, Map<String, dynamic> updates) async {
    updates['updated_at'] = DateTime.now().toUtc().toIso8601String();
    await SupabaseService.from('branding').update(updates).eq('id', id);
  }

  static Future<String> uploadLogo(String tenantId, String branchId, List<int> imageBytes) async {
    final path = '$tenantId/$branchId/logo.png';
    await SupabaseService.storage.from('menu-images').uploadBinary(
      path, imageBytes,
      fileOptions: const FileOptions(contentType: 'image/png', upsert: true),
    );
    return SupabaseService.storage.from('menu-images').getPublicUrl(path);
  }
}
