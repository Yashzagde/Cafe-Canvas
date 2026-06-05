import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cafecanva_core/cafecanva_core.dart';
import 'package:cafecanva_ui/cafecanva_ui.dart';

/// Store Admin login screen — email + password authentication via Supabase Auth.
/// Only users with 'manager' or 'owner' role in app_metadata can proceed.
class LoginScreen extends StatefulWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await AuthService.signInWithEmail(
        _emailController.text.trim(),
        _passwordController.text,
      );

      if (response.session == null) {
        setState(() {
          _errorMessage = 'Login failed. Please check your credentials.';
          _isLoading = false;
        });
        return;
      }

      // Verify role — only manager/owner can access store admin
      final role = response.user?.appMetadata['role'] as String?;
      if (role != 'manager' && role != 'owner' && role != 'TENANT_OWNER' && role != 'BRANCH_ADMIN') {
        await AuthService.signOut();
        if (mounted) {
          setState(() {
            _errorMessage = 'Access denied. Only managers and owners can use this app.';
            _isLoading = false;
          });
        }
        return;
      }

      // Success — navigate to dashboard
      if (mounted) {
        context.go('/');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = _parseError(e.toString());
          _isLoading = false;
        });
      }
    }
  }

  String _parseError(String error) {
    if (error.contains('Invalid login credentials')) {
      return 'Invalid email or password. Please try again.';
    }
    if (error.contains('Email not confirmed')) {
      return 'Please verify your email address before logging in.';
    }
    if (error.contains('Too many requests')) {
      return 'Too many login attempts. Please wait and try again.';
    }
    return 'Something went wrong. Please try again.';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(CafeCanvaSpacing.xl),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 400),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Logo & Branding
                    const Icon(
                      Icons.restaurant_menu,
                      size: 64,
                      color: CafeCanvaColors.primary,
                    ),
                    const SizedBox(height: CafeCanvaSpacing.lg),
                    const Text(
                      'CafeCanvas',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        color: CafeCanvaColors.primaryDark,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: CafeCanvaSpacing.xs),
                    const Text(
                      'Store Admin',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: CafeCanvaColors.stone500,
                        letterSpacing: 2.0,
                      ),
                    ),
                    const SizedBox(height: CafeCanvaSpacing.xxl),

                    // Error message
                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(CafeCanvaSpacing.md),
                        margin: const EdgeInsets.only(bottom: CafeCanvaSpacing.lg),
                        decoration: BoxDecoration(
                          color: CafeCanvaColors.error.withOpacity(0.08),
                          borderRadius: const BorderRadius.all(CafeCanvaRadius.md),
                          border: Border.all(color: CafeCanvaColors.error.withOpacity(0.3)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.error_outline, color: CafeCanvaColors.error, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage!,
                                style: const TextStyle(
                                  color: CafeCanvaColors.error,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Email field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      textInputAction: TextInputAction.next,
                      autocorrect: false,
                      decoration: const InputDecoration(
                        labelText: 'Email Address',
                        prefixIcon: Icon(Icons.email_outlined),
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!value.contains('@') || !value.contains('.')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: CafeCanvaSpacing.lg),

                    // Password field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _handleLogin(),
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                          ),
                          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: CafeCanvaSpacing.xl),

                    // Login button
                    SizedBox(
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _handleLogin,
                        child: _isLoading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2.5,
                                ),
                              )
                            : const Text(
                                'SIGN IN',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  letterSpacing: 1.0,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: CafeCanvaSpacing.xxl),

                    // Footer
                    const Text(
                      'Only authorized managers and owners\ncan access the Store Admin app.',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 12,
                        color: CafeCanvaColors.stone400,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
