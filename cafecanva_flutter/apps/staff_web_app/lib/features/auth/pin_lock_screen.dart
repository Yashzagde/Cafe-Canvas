import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// 4-digit PIN unlock screen for quick staff re-authentication.
/// The PIN is stored locally in Flutter secure storage, keyed to the user ID.
class PinLockScreen extends ConsumerStatefulWidget {
  const PinLockScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<PinLockScreen> createState() => _PinLockScreenState();
}

class _PinLockScreenState extends ConsumerState<PinLockScreen> {
  static const _storage = FlutterSecureStorage();
  String _entered = '';
  String? _error;
  bool _isSetup = false; // true if no PIN stored yet → setup mode
  String? _firstEntry; // For setup confirmation

  @override
  void initState() {
    super.initState();
    _checkPinExists();
  }

  Future<void> _checkPinExists() async {
    final pin = await _storage.read(key: 'staff_pin');
    setState(() => _isSetup = (pin == null));
  }

  void _onDigit(int digit) {
    if (_entered.length >= 4) return;
    setState(() {
      _entered += digit.toString();
      _error = null;
    });

    if (_entered.length == 4) {
      _handleComplete();
    }
  }

  void _onBackspace() {
    if (_entered.isEmpty) return;
    setState(() {
      _entered = _entered.substring(0, _entered.length - 1);
      _error = null;
    });
  }

  Future<void> _handleComplete() async {
    if (_isSetup) {
      // Setup flow: confirm PIN
      if (_firstEntry == null) {
        _firstEntry = _entered;
        setState(() {
          _entered = '';
          _error = null;
        });
        return;
      }

      // Confirming
      if (_firstEntry == _entered) {
        await _storage.write(key: 'staff_pin', value: _entered);
        if (mounted) context.go('/dashboard');
      } else {
        setState(() {
          _error = 'PINs do not match. Try again.';
          _entered = '';
          _firstEntry = null;
        });
      }
    } else {
      // Unlock flow
      final stored = await _storage.read(key: 'staff_pin');
      if (_entered == stored) {
        if (mounted) context.go('/dashboard');
      } else {
        HapticFeedback.heavyImpact();
        setState(() {
          _error = 'Incorrect PIN';
          _entered = '';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = _isSetup
        ? (_firstEntry == null ? 'Set your PIN' : 'Confirm PIN')
        : 'Enter PIN';

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 360),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Title
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _isSetup
                      ? 'Create a 4-digit PIN for quick unlock'
                      : 'Unlock to continue your shift',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                  ),
                ),
                const SizedBox(height: 32),

                // PIN dots
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(4, (i) {
                    final filled = i < _entered.length;
                    return Container(
                      margin: const EdgeInsets.symmetric(horizontal: 10),
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: filled
                            ? const Color(0xFFE28743)
                            : Colors.transparent,
                        border: Border.all(
                          color: filled
                              ? const Color(0xFFE28743)
                              : theme.colorScheme.onSurface.withOpacity(0.2),
                          width: 2,
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 12),

                // Error
                if (_error != null)
                  Text(
                    _error!,
                    style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                const SizedBox(height: 28),

                // Numpad
                _buildNumpad(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNumpad() {
    return Column(
      children: [
        for (int row = 0; row < 4; row++)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (int col = 0; col < 3; col++)
                _numpadButton(row, col),
            ],
          ),
      ],
    );
  }

  Widget _numpadButton(int row, int col) {
    // Layout: 1-9, empty, 0, backspace
    if (row == 3) {
      if (col == 0) return const SizedBox(width: 80, height: 64);
      if (col == 1) {
        return _digitButton(0);
      }
      if (col == 2) {
        return SizedBox(
          width: 80,
          height: 64,
          child: IconButton(
            onPressed: _onBackspace,
            icon: const Icon(Icons.backspace_outlined, size: 22),
          ),
        );
      }
    }
    final digit = row * 3 + col + 1;
    return _digitButton(digit);
  }

  Widget _digitButton(int digit) {
    return SizedBox(
      width: 80,
      height: 64,
      child: TextButton(
        onPressed: () => _onDigit(digit),
        style: TextButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: Text(
          '$digit',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
