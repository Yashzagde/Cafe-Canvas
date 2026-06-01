import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';

class CcError {
  static String friendly(Object error) {
    if (error is PostgrestException) {
      return switch (error.code) {
        '23505' => 'This record already exists in our system.',
        '42501' => 'Unauthorized operation. You do not have permission to modify this data.',
        '23503' => 'Related resource mapping not found.',
        _       => 'A database error occurred. Code: ${error.code}. Message: ${error.message}',
      };
    }
    if (error is AuthException) {
      return error.message;
    }
    if (error is SocketException) {
      return 'No internet connection detected. Please verify your network settings.';
    }
    return error.toString();
  }
}
