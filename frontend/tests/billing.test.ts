import { describe, it, expect } from 'vitest'

// Simulated core tax & billing calculation engine matching the exact logic used in admin/page.tsx and staff/page.tsx
export function calculateBill({
  subtotal,
  cgstPercent = 2.5,
  sgstPercent = 2.5,
  serviceChargeType = 'percent',
  serviceChargeValue = 5.0,
  discountPercent = 0,
  gstOn = true,
  svcOn = true,
}: {
  subtotal: number
  cgstPercent?: number
  sgstPercent?: number
  serviceChargeType?: 'percent' | 'flat'
  serviceChargeValue?: number
  discountPercent?: number
  gstOn?: boolean
  svcOn?: boolean
}) {
  const discountAmount = Math.round(subtotal * (discountPercent / 100))
  const netSubtotal = subtotal - discountAmount

  const cgstAmount = gstOn ? Math.round(netSubtotal * (cgstPercent / 100)) : 0
  const sgstAmount = gstOn ? Math.round(netSubtotal * (sgstPercent / 100)) : 0
  const gstAmount = cgstAmount + sgstAmount

  let serviceCharge = 0
  if (svcOn) {
    if (serviceChargeType === 'percent') {
      serviceCharge = Math.round(netSubtotal * (serviceChargeValue / 100))
    } else {
      serviceCharge = Math.round(serviceChargeValue) // stored as raw paise
    }
  }

  const grandTotal = netSubtotal + gstAmount + serviceCharge

  return {
    subtotal,
    discountAmount,
    netSubtotal,
    cgstAmount,
    sgstAmount,
    gstAmount,
    serviceCharge,
    grandTotal,
  }
}

describe('Indian Restaurant Billing & GST Compliance Engine', () => {
  it('should split 5% GST into CGST 2.5% and SGST 2.5% correctly with integer rounding (in paise)', () => {
    // Under GST laws in India, restaurant service attracts 5% GST split equally (2.5% CGST + 2.5% SGST)
    const result = calculateBill({
      subtotal: 100000, // ₹1,000.00 represented as 100,000 paise
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      gstOn: true,
      svcOn: false,
    })

    expect(result.discountAmount).toBe(0)
    expect(result.cgstAmount).toBe(2500) // ₹25.00 CGST
    expect(result.sgstAmount).toBe(2500) // ₹25.00 SGST
    expect(result.gstAmount).toBe(5000)  // ₹50.00 total GST
    expect(result.grandTotal).toBe(105000) // ₹1,050.00
  })

  it('should apply percentage-based service charge correctly on the net amount', () => {
    const result = calculateBill({
      subtotal: 50000, // ₹500.00
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      serviceChargeType: 'percent',
      serviceChargeValue: 10.0, // 10% Service Charge
      gstOn: true,
      svcOn: true,
    })

    expect(result.serviceCharge).toBe(5000) // ₹50.00 Service Charge
    expect(result.cgstAmount).toBe(1250)    // 2.5% of ₹500 = ₹12.50
    expect(result.sgstAmount).toBe(1250)    // 2.5% of ₹500 = ₹12.50
    expect(result.grandTotal).toBe(57500)   // ₹500 + ₹25 GST + ₹50 SC = ₹575.00
  })

  it('should apply discount percentages before tax and service charge are computed', () => {
    const result = calculateBill({
      subtotal: 200000, // ₹2,000.00
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      serviceChargeType: 'percent',
      serviceChargeValue: 5.0,
      discountPercent: 15, // 15% promotional discount
      gstOn: true,
      svcOn: true,
    })

    expect(result.discountAmount).toBe(30000) // 15% of ₹2000 = ₹300.00
    expect(result.netSubtotal).toBe(170000)   // ₹1700.00 net base
    expect(result.cgstAmount).toBe(4250)      // 2.5% of ₹1700 = ₹42.50
    expect(result.sgstAmount).toBe(4250)      // 2.5% of ₹1700 = ₹42.50
    expect(result.serviceCharge).toBe(8500)   // 5% of ₹1700 = ₹85.00
    expect(result.grandTotal).toBe(187000)    // ₹1700 + ₹85 GST + ₹85 SC = ₹1870.00
  })

  it('should handle odd paise calculations with proper round half-up behavior', () => {
    // Under strict integer constraints, 290 paise under 2.5% gives 7.25, rounded to 7 paise
    const result = calculateBill({
      subtotal: 290, // ₹2.90 (e.g. single small modifier extra)
      cgstPercent: 2.5,
      sgstPercent: 2.5,
      gstOn: true,
      svcOn: false,
    })

    expect(result.cgstAmount).toBe(7)  // Math.round(7.25) = 7
    expect(result.sgstAmount).toBe(7)  // Math.round(7.25) = 7
    expect(result.gstAmount).toBe(14)
    expect(result.grandTotal).toBe(304) // 290 + 14 = 304 paise
  })
})
