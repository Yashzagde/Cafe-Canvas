class SecureCacheKeys {
  static const String refreshToken = 'cc_refresh_token';    // Revocable refresh token
  static const String staffPinHash = 'cc_pin_hash';         // Encrypted bcrypt PIN hash
  static const String staffProfile = 'cc_staff_profile';    // Minimal profile snap (no secrets)
  static const String lastBranchId = 'cc_branch_id';        // Caches active branch scope
}
