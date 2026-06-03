import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Generate cryptographically secure random challenge
    const challenge = crypto.randomBytes(32).toString('base64url');

    const options = {
      challenge,
      rpId: 'cafecanvas.bar',
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: [],
    };

    return NextResponse.json({ success: true, options });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
