import 'dart:typed_data';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/store_settings.dart';
import '../services/supabase_service.dart';

/// Repository for store settings and branding.
class SettingsRepository {
  SettingsRepository._();

  static Future<StoreSettings?> getStoreSettings(String tenantId, String locationId) async {
    final data = await SupabaseService.from('store_settings')
        .select()
        .eq('tenant_id', tenantId)
        .maybeSingle();
    if (data == null) return null;
    return StoreSettings.fromJson(data);
  }

  static Future<void> updateStoreSettings(String id, Map<String, dynamic> updates) async {
    updates['updated_at'] = DateTime.now().toUtc().toIso8601String();
    await SupabaseService.from('store_settings').update(updates).eq('id', id);
  }



  static Future<String> uploadLogo(String tenantId, String locationId, List<int> imageBytes) async {
    final path = '$tenantId/$locationId/logo.png';
    await SupabaseService.storage.from('menu-images').uploadBinary(
      path,
      Uint8List.fromList(imageBytes),
      fileOptions: const FileOptions(contentType: 'image/png', upsert: true),
    );
    return SupabaseService.storage.from('menu-images').getPublicUrl(path);
  }
}
