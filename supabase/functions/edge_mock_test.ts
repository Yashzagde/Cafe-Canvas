// Mock Edge Functions Verification Suite
// This script simulates and audits the core security and cryptographic behaviors of the Deno Edge Functions.

import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

// 1. Simulating verify-payment Signature Matching (HMAC-SHA256)
export async function simulateRazorpayVerification({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
  keySecret,
}: {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  keySecret: string
}) {
  const body = razorpay_order_id + '|' + razorpay_payment_id
  const encoder = new TextEncoder()
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const expectedSig = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedSig === razorpay_signature
}

// 2. Simulating Staff Call Cooldown Constraints
export function checkStaffCallCooldown(recentCallTime: string | null, cooldownMinutes = 2): { allowed: boolean; remainingSeconds: number } {
  if (!recentCallTime) {
    return { allowed: true, remainingSeconds: 0 }
  }

  const calledAt = new Date(recentCallTime).getTime()
  const now = Date.now()
  const cooldownMs = cooldownMinutes * 60 * 1000
  const elapsed = now - calledAt

  if (elapsed < cooldownMs) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((cooldownMs - elapsed) / 1000)
    }
  }

  return { allowed: true, remainingSeconds: 0 }
}

// --- Local Runner (Deno Assertion Verification) ---
async function runEdgeVerification() {
  console.log("=== Edge Function Simulation Assertions ===")

  // Test Case 1: HMAC Crypto Signature Match
  const mockSecret = "rzp_secret_key_12345"
  const orderId = "order_O1A2B3C4D5"
  const paymentId = "pay_P9Q8R7S6T5"
  
  // Pre-calculated signature for orderId + '|' + paymentId using mockSecret
  // Expected body: "order_O1A2B3C4D5|pay_P9Q8R7S6T5"
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(mockSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(orderId + '|' + paymentId))
  const calculatedSig = Array.from(new Uint8Array(sigBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')

  const isValid = await simulateRazorpayVerification({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: calculatedSig,
    keySecret: mockSecret
  })
  
  console.log(`[Verify Payment Signature]: ${isValid ? "✅ PASSED" : "❌ FAILED"}`)

  // Test Case 2: Incorrect Secret Keys Reject Signatures
  const isInvalid = await simulateRazorpayVerification({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: calculatedSig,
    keySecret: "wrong_secret_key"
  })
  console.log(`[Reject Invalid Signature]: ${!isInvalid ? "✅ PASSED" : "❌ FAILED"}`)

  // Test Case 3: Staff Call Cooldown Restrictions
  const twoMinsAgo = new Date(Date.now() - 120000).toISOString()
  const resultBlocked = checkStaffCallCooldown(twoMinsAgo)
  console.log(`[Cooldown Active Block]: ${!resultBlocked.allowed ? "✅ PASSED" : "❌ FAILED"}`)

  const tenMinsAgo = new Date(Date.now() - 600000).toISOString()
  const resultAllowed = checkStaffCallCooldown(tenMinsAgo)
  console.log(`[Cooldown Expired Allow]: ${resultAllowed.allowed ? "✅ PASSED" : "❌ FAILED"}`)

  console.log("=== Verification Complete ===")
}

if (import.meta.main) {
  await runEdgeVerification()
}
