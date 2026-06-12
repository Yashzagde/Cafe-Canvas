package com.example.staff_pos

import android.content.Context
import android.hardware.usb.UsbManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.cafecanva.pos/hardware"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "isUsbDeviceConnected") {
                val usbManager = getSystemService(Context.USB_SERVICE) as UsbManager
                val deviceList = usbManager.deviceList
                val isConnected = deviceList.isNotEmpty()
                result.success(isConnected)
            } else {
                result.notImplemented()
            }
        }
    }
}
