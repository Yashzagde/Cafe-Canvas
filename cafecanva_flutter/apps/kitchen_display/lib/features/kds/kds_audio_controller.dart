import 'package:audioplayers/audioplayers.dart';

class KdsAudioController {
  final AudioPlayer _player = AudioPlayer();
  final Set<String> _chimingOrderIds = {};
  bool _muted = false;
  bool get isMuted => _muted;

  Future<void> chimeForOrder(String orderId) async {
    _chimingOrderIds.add(orderId);
    if (_muted) return;
    try {
      await _player.setReleaseMode(ReleaseMode.loop);
      await _player.play(AssetSource('audio/kds_chime.mp3'));
    } catch (_) {
      // Fallback in case of missing assets or platform problems
    }
  }

  Future<void> stopChimeForOrder(String orderId) async {
    _chimingOrderIds.remove(orderId);
    if (_chimingOrderIds.isEmpty) {
      try {
        await _player.stop();
      } catch (_) {}
    }
  }

  void toggleMute() {
    _muted = !_muted;
    try {
      if (_muted) {
        _player.pause();
      } else if (_chimingOrderIds.isNotEmpty) {
        _player.resume();
      }
    } catch (_) {}
  }

  void dispose() {
    _player.dispose();
  }
}
