import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  let localIp = '127.0.0.1';
  
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      const iface = interfaces[name];
      if (iface) {
        for (const config of iface) {
          // Skip internal (loopback) and non-IPv4 addresses
          if (!config.internal && config.family === 'IPv4') {
            localIp = config.address;
            break;
          }
        }
      }
      if (localIp !== '127.0.0.1') {
        break;
      }
    }
  } catch (error) {
    console.error('Failed to retrieve local IP:', error);
  }

  return NextResponse.json({ localIp });
}
