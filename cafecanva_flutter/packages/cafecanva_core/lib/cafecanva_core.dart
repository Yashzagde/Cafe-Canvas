/// CafeCanva Core — shared models, services, repositories, and providers.
library cafecanva_core;

// Config
export 'config/env_config.dart';

// Models
export 'models/tenant.dart';
export 'models/branch.dart';
export 'models/user_profile.dart';
export 'models/menu_category.dart';
export 'models/menu_item.dart';
export 'models/modifier_group.dart';
export 'models/modifier_option.dart';
export 'models/table_model.dart';
export 'models/table_session.dart';
export 'models/order.dart';
export 'models/order_item.dart';
export 'models/bill.dart';
export 'models/customer.dart';
export 'models/discount.dart';
export 'models/coupon.dart';
export 'models/store_settings.dart';
export 'models/staff_call.dart';
export 'models/attendance.dart';
export 'models/notification_log_entry.dart';
export 'models/branding.dart';
export 'models/storefront_config.dart';

// Services
export 'services/supabase_service.dart';
export 'services/auth_service.dart';
export 'services/realtime_service.dart';

// Repositories
export 'repositories/menu_repository.dart';
export 'repositories/order_repository.dart';
export 'repositories/table_repository.dart';
export 'repositories/billing_repository.dart';
export 'repositories/customer_repository.dart';
export 'repositories/settings_repository.dart';
export 'repositories/staff_repository.dart';
export 'repositories/analytics_repository.dart';

// Providers
export 'providers/supabase_providers.dart';
export 'providers/auth_providers.dart';
export 'providers/connectivity_provider.dart';

// Utils
export 'utils/currency_formatter.dart';
export 'utils/date_formatter.dart';
export 'utils/validators.dart';
export 'utils/constants.dart';
