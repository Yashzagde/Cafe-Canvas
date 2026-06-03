import '../models/customer.dart';
import '../services/supabase_service.dart';

/// Repository for customer CRM operations.
class CustomerRepository {
  CustomerRepository._();

  static Future<List<Customer>> getCustomers(String tenantId, String branchId) async {
    final data = await SupabaseService.from('customers')
        .select()
        .eq('tenant_id', tenantId)
        .eq('branch_id', branchId)
        .is_('deleted_at', null)
        .order('name');
    return (data as List).map((e) => Customer.fromJson(e)).toList();
  }

  static Future<Customer> createCustomer(Map<String, dynamic> customer) async {
    final data = await SupabaseService.from('customers')
        .insert(customer).select().single();
    return Customer.fromJson(data);
  }

  static Future<void> updateCustomer(String id, Map<String, dynamic> updates) async {
    await SupabaseService.from('customers').update(updates).eq('id', id);
  }

  static Future<Customer?> findByPhone(String tenantId, String phone) async {
    final data = await SupabaseService.from('customers')
        .select()
        .eq('tenant_id', tenantId)
        .eq('phone', phone)
        .is_('deleted_at', null)
        .maybeSingle();
    if (data == null) return null;
    return Customer.fromJson(data);
  }
}
