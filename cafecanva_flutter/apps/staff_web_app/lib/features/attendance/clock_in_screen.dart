import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:geolocator/geolocator.dart';
import 'package:intl/intl.dart';

/// Clock-in/out screen with geolocation capture.
/// On web, uses browser Geolocation API via geolocator_web.
/// On mobile, uses native GPS via geolocator.
class ClockInScreen extends ConsumerStatefulWidget {
  const ClockInScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<ClockInScreen> createState() => _ClockInScreenState();
}

class _ClockInScreenState extends ConsumerState<ClockInScreen> {
  bool _loading = true;
  bool _submitting = false;
  bool _isClockedIn = false;
  String? _clockInTime;
  String? _currentAttendanceId;
  Position? _currentPosition;
  String? _error;

  @override
  void initState() {
    super.initState();
    _checkCurrentStatus();
  }

  Future<void> _checkCurrentStatus() async {
    setState(() => _loading = true);

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) return;

      final record = await Supabase.instance.client
          .from('staff_attendance')
          .select('id, clock_in')
          .eq('staff_id', user.id)
          .eq('status', 'clocked_in')
          .maybeSingle();

      if (record != null) {
        setState(() {
          _isClockedIn = true;
          _currentAttendanceId = record['id'] as String;
          _clockInTime = record['clock_in'] as String;
        });
      }
    } catch (e) {
      setState(() => _error = 'Failed to check status: $e');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<Position?> _getLocation() async {
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() => _error = 'Location services are disabled.');
        return null;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          setState(() => _error = 'Location permission denied.');
          return null;
        }
      }

      if (permission == LocationPermission.deniedForever) {
        setState(() => _error = 'Location permanently denied. Enable in settings.');
        return null;
      }

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      setState(() => _error = 'Location error: $e');
      return null;
    }
  }

  Future<void> _clockIn() async {
    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('Not authenticated');

      final position = await _getLocation();
      final locationId = user.appMetadata['location_id'] as String? ??
          user.appMetadata['branch_id'] as String? ?? '';

      final result = await Supabase.instance.client.rpc('clock_in_staff', params: {
        'p_staff_id': user.id,
        'p_branch_id': locationId,
        'p_lat': position?.latitude,
        'p_lng': position?.longitude,
        'p_address': position != null
            ? '${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}'
            : null,
      });

      setState(() {
        _isClockedIn = true;
        _currentAttendanceId = result['id'] as String?;
        _clockInTime = result['clock_in'] as String?;
      });
    } catch (e) {
      setState(() => _error = 'Clock-in failed: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  Future<void> _clockOut() async {
    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) throw Exception('Not authenticated');

      final position = await _getLocation();

      await Supabase.instance.client.rpc('clock_out_staff', params: {
        'p_staff_id': user.id,
        'p_lat': position?.latitude,
        'p_lng': position?.longitude,
      });

      setState(() {
        _isClockedIn = false;
        _currentAttendanceId = null;
        _clockInTime = null;
      });
    } catch (e) {
      setState(() => _error = 'Clock-out failed: $e');
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  String _formatDuration() {
    if (_clockInTime == null) return '--:--';
    final start = DateTime.parse(_clockInTime!);
    final diff = DateTime.now().difference(start);
    final hours = diff.inHours;
    final minutes = diff.inMinutes.remainder(60);
    return '${hours}h ${minutes}m';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/dashboard'),
        ),
        title: const Text('Attendance', style: TextStyle(fontWeight: FontWeight.w800)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(32),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 400),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Status badge
                      Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _isClockedIn
                              ? const Color(0xFF10B981).withOpacity(0.12)
                              : Colors.red.withOpacity(0.08),
                          border: Border.all(
                            color: _isClockedIn
                                ? const Color(0xFF10B981).withOpacity(0.3)
                                : Colors.red.withOpacity(0.2),
                            width: 3,
                          ),
                        ),
                        child: Icon(
                          _isClockedIn ? Icons.timer : Icons.timer_off,
                          size: 48,
                          color: _isClockedIn ? const Color(0xFF10B981) : Colors.red,
                        ),
                      ),
                      const SizedBox(height: 24),

                      Text(
                        _isClockedIn ? 'On Shift' : 'Off Duty',
                        style: theme.textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: _isClockedIn ? const Color(0xFF10B981) : Colors.red,
                        ),
                      ),
                      const SizedBox(height: 8),

                      if (_isClockedIn && _clockInTime != null) ...[
                        Text(
                          'Clocked in at ${DateFormat.jm().format(DateTime.parse(_clockInTime!).toLocal())}',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onSurface.withOpacity(0.5),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Duration: ${_formatDuration()}',
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.w700,
                            color: const Color(0xFFE28743),
                          ),
                        ),
                      ],

                      const SizedBox(height: 32),

                      // Error
                      if (_error != null)
                        Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.red.withOpacity(0.3)),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.warning_amber, color: Colors.red, size: 18),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _error!,
                                  style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.w600),
                                ),
                              ),
                            ],
                          ),
                        ),

                      // Clock In / Out Button
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: FilledButton.icon(
                          onPressed: _submitting ? null : (_isClockedIn ? _clockOut : _clockIn),
                          icon: _submitting
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : Icon(_isClockedIn ? Icons.logout : Icons.login, size: 20),
                          label: Text(
                            _submitting
                                ? 'Processing...'
                                : (_isClockedIn ? 'Clock Out' : 'Clock In'),
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: _isClockedIn
                                ? Colors.red
                                : const Color(0xFF10B981),
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 12),
                      Text(
                        'Location will be captured automatically',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurface.withOpacity(0.4),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}
