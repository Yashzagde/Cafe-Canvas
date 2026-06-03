/**
 * @file src/lib/qr.ts
 * @description HMAC-SHA256 signed QR tokens for table ordering.
 *   Each token encodes tenantId + tableId + qrVersion so that
 *   incrementing qrVersion (invalidate_table_qr) instantly voids old QRs.
 */
import { createHmac, timingSafeEqual } from 'crypto'

const QR_SECRET = process.env.QR_HMAC_SECRET || 'cafecanvas-fallback-secret-for-development-only-replace-in-prod'

/** Payload embedded in every QR code URL */
export interface QRPayload {
  tenantId:   string
  tableId:    string
  qrVersion:  number
}

/**
 * Generate an HMAC-signed token string for a table.
 * @returns Base64URL-safe token: `<payload_b64>.<sig_b64>`
 */
export function generateTableQRToken(payload: QRPayload): string {
  const data   = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig    = createHmac('sha256', QR_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

/**
 * Verify an HMAC-signed token string for a table.
 * @returns Parsed payload if valid, otherwise null.
 */
export function verifyTableQRToken(token: string): QRPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 2) return null
    const [data, sig] = parts

    // Recalculate signature
    const expectedSig = createHmac('sha256', QR_SECRET).update(data).digest('base64url')

    // Timing safe comparison
    const sigBuffer = Buffer.from(sig, 'base64url')
    const expectedBuffer = Buffer.from(expectedSig, 'base64url')

    if (sigBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(sigBuffer, expectedBuffer)) return null

    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as QRPayload
    return payload
  } catch (err) {
    return null
  }
}
