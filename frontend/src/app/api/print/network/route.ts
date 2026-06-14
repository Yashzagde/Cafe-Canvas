import { NextResponse } from 'next/server';
import net from 'net';

export async function POST(request: Request) {
  try {
    const { ip, port = 9100, payload } = await request.json();

    if (!ip) {
      return NextResponse.json({ error: 'Printer IP address is required' }, { status: 400 });
    }

    if (!payload || !Array.isArray(payload)) {
      return NextResponse.json({ error: 'Invalid print payload bytes' }, { status: 400 });
    }

    const bytes = Buffer.from(payload);

    await new Promise<void>((resolve, reject) => {
      const socket = new net.Socket();
      
      socket.setTimeout(5000); // 5 seconds timeout

      socket.connect(port, ip, () => {
        socket.write(bytes, () => {
          socket.end();
          resolve();
        });
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timed out'));
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Network print proxy error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to communicate with network printer' },
      { status: 500 }
    );
  }
}
