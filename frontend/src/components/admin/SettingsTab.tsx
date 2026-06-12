'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Clock, 
  Percent, 
  CreditCard, 
  ShieldCheck, 
  ExternalLink, 
  AlertTriangle,
  Sparkles,
  Save,
  Loader2
} from 'lucide-react';
import { T, ff, Btn, Input, Sel } from '@/components/admin/UIPrimitives';
import { getSettingsAction, updateGeneralSettingsAction, updateStoreSettingsAction } from '@/app/admin/actions/settings.actions';
import { createClient } from '@/utils/supabase/client';

const InputAny = Input as any;

type TabType = 'general' | 'hours' | 'tax' | 'payments' | 'subscription' | 'account';

interface SettingsTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  tenantName: string;
  setTenantName: React.Dispatch<React.SetStateAction<string>>;
  setTenantLogoUrl?: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function SettingsTab({ toast, tenantName, setTenantName, setTenantLogoUrl }: SettingsTabProps) {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  // General tab states
  const [storeName, setStoreName] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storeCity, setStoreCity] = useState('');
  const [storeState, setStoreState] = useState('');
  const [storePincode, setStorePincode] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<'Free' | 'Pro' | 'Growth' | 'Enterprise'>('Free');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Tax tab states
  const [cgst, setCgst] = useState(2.5);
  const [sgst, setSgst] = useState(2.5);
  const [taxInclusive, setTaxInclusive] = useState(false);
  const [serviceChargeType, setServiceChargeType] = useState('none');
  const [serviceChargeValue, setServiceChargeValue] = useState(0.00);

  // Payments tab states
  const [razorpayKey, setRazorpayKey] = useState('');
  const [upiId, setUpiId] = useState('');
  const [activeGateway, setActiveGateway] = useState('razorpay');
  const [phonepeMerchantId, setPhonepeMerchantId] = useState('');
  const [phonepeTerminalId, setPhonepeTerminalId] = useState('');
  const [googlepayMerchantId, setGooglepayMerchantId] = useState('');
  const [googlepayTerminalId, setGooglepayTerminalId] = useState('');
  const [paytmMerchantId, setPaytmMerchantId] = useState('');
  const [paytmTerminalId, setPaytmTerminalId] = useState('');
  const [bharatpeMerchantId, setBharatpeMerchantId] = useState('');
  const [bharatpeTerminalId, setBharatpeTerminalId] = useState('');

  // Hours tab states
  const [openTime, setOpenTime] = useState('09:00');
  const [closeTime, setCloseTime] = useState('22:00');

  // Load configuration from Supabase
  const loadConfig = async () => {
    setLoading(true);
    try {
      const data = await getSettingsAction();
      if (data) {
        const { tenant, settings } = data;
        
        // Populate general details
        setStoreName(tenant.name || '');
        setStorePhone(tenant.phone || '');
        setStoreAddress(tenant.address || '');
        setStoreCity(tenant.city || '');
        setStoreState(tenant.state || '');
        setStorePincode(tenant.pincode || '');
        setSubscriptionTier(tenant.subscription_tier || 'Free');
        setLogoUrl(tenant.logo_url || '');

        // Populate store configurations (converting basis points back to percentages)
        if (settings) {
          setCgst((settings.tax_cgst || 250) / 100);
          setSgst((settings.tax_sgst || 250) / 100);
          setTaxInclusive(settings.tax_inclusive || false);
          setRazorpayKey(settings.razorpay_key_id || '');
          setUpiId(settings.upi_id || '');
          setActiveGateway((settings as any).active_gateway || 'razorpay');
          setPhonepeMerchantId((settings as any).phonepe_merchant_id || '');
          setPhonepeTerminalId((settings as any).phonepe_terminal_id || '');
          setGooglepayMerchantId((settings as any).googlepay_merchant_id || '');
          setGooglepayTerminalId((settings as any).googlepay_terminal_id || '');
          setPaytmMerchantId((settings as any).paytm_merchant_id || '');
          setPaytmTerminalId((settings as any).paytm_terminal_id || '');
          setBharatpeMerchantId((settings as any).bharatpe_merchant_id || '');
          setBharatpeTerminalId((settings as any).bharatpe_terminal_id || '');
          setOpenTime(settings.open_time?.slice(0, 5) || '09:00');
          setCloseTime(settings.close_time?.slice(0, 5) || '22:00');
          setServiceChargeType((settings as any).service_charge_type || 'none');
          setServiceChargeValue(parseFloat((settings as any).service_charge_value?.toString() || '0.00'));
        }
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      toast(err.message || 'Failed to load configuration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLogoUrl(publicUrl);
      toast('🎉 Logo uploaded successfully!', 'success');
    } catch (err: any) {
      console.error('Logo upload error:', err);
      toast(err.message || 'Logo upload failed.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      toast('Store name cannot be empty.', 'warning');
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateGeneralSettingsAction({
        name: storeName,
        phone: storePhone,
        address: storeAddress,
        city: storeCity,
        state: storeState,
        pincode: storePincode,
        logo_url: logoUrl,
      });

      if (updated) {
        setTenantName(updated.name);
        if (setTenantLogoUrl) {
          setTenantLogoUrl(updated.logo_url || null);
        }
        toast('Store details successfully updated!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to save store details.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateStoreSettingsAction({
        tax_cgst: cgst,
        tax_sgst: sgst,
        tax_inclusive: taxInclusive,
        razorpay_key_id: razorpayKey,
        upi_id: upiId,
        open_time: openTime,
        close_time: closeTime,
        service_charge_type: serviceChargeType,
        service_charge_value: serviceChargeValue,
        active_gateway: activeGateway,
        phonepe_merchant_id: phonepeMerchantId,
        phonepe_terminal_id: phonepeTerminalId,
        googlepay_merchant_id: googlepayMerchantId,
        googlepay_terminal_id: googlepayTerminalId,
        paytm_merchant_id: paytmMerchantId,
        paytm_terminal_id: paytmTerminalId,
        bharatpe_merchant_id: bharatpeMerchantId,
        bharatpe_terminal_id: bharatpeTerminalId,
      });

      if (updated) {
        toast('Preferences successfully updated!', 'success');
      }
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to save configuration.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPricing = () => {
    window.open('https://cafecanvas.bar/pricing', '_blank');
  };

  const tabsConfig = [
    { id: 'general' as TabType, label: 'General Details', icon: Settings },
    { id: 'hours' as TabType, label: 'Operating Hours', icon: Clock },
    { id: 'tax' as TabType, label: 'Taxation Rules', icon: Percent },
    { id: 'payments' as TabType, label: 'Payment Gateway', icon: CreditCard },
    { id: 'subscription' as TabType, label: 'Merchant Plan', icon: Sparkles },
    { id: 'account' as TabType, label: 'System Access', icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-3 text-[#1c1917]">
        <Loader2 className="w-8 h-8 text-[#d97706] animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase opacity-60">Loading Store Profiles...</span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "24px", fontFamily: ff, color: T.tx, animation: "fade-in 0.2s ease-out" }}>
      {/* Left Navigation Pane */}
      <div style={{
        width: "240px",
        background: T.card,
        padding: "16px",
        borderRadius: "16px",
        border: `1px solid ${T.bdr}`,
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        height: "fit-content"
      }}>
        <h3 style={{
          fontSize: "10px",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: T.mu,
          paddingLeft: "12px",
          marginBottom: "8px"
        }}>
          Store Settings
        </h3>
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                background: isActive ? T.iA(0.12) : "transparent",
                color: isActive ? T.ind : T.mu2,
                borderLeft: isActive ? `3px solid ${T.ind}` : "3px solid transparent",
                textAlign: "left"
              }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right Content Pane */}
      <div style={{
        flex: 1,
        background: T.card,
        padding: "32px",
        borderRadius: "24px",
        border: `1px solid ${T.bdr}`,
        minHeight: "480px"
      }}>
        {/* TAB 1: GENERAL DETAILS */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>General Details</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Define your storefront visual name and geographic credentials.</p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Business Logo Upload */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#fafaf9",
                  border: `1px solid ${T.bdr}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0
                }}>
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "20px" }}>🏪</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>Business Logo</span>
                  <span style={{ fontSize: "9px", color: T.mu, fontWeight: 500 }}>Recommend 256x256 square PNG/JPG image.</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                    <label style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: T.iA(0.12),
                      color: T.ind,
                      fontSize: "10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.15s"
                    }}>
                      <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoFileSelect}
                        disabled={uploadingLogo}
                        style={{ display: "none" }}
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        style={{
                          background: "none",
                          border: "none",
                          color: T.rose,
                          fontSize: "10px",
                          fontWeight: 700,
                          cursor: "pointer",
                          padding: "4px 8px"
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <Input
                label="Store Name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="My Cafe Canvas"
              />
              <Input
                label="Store Phone"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              <Input
                label="Street Address"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="123 Artisan Lane, Indiranagar"
              />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <Input
                  label="City"
                  value={storeCity}
                  onChange={(e) => setStoreCity(e.target.value)}
                  placeholder="Bengaluru"
                />
                <Input
                  label="State"
                  value={storeState}
                  onChange={(e) => setStoreState(e.target.value)}
                  placeholder="Karnataka"
                />
                <Input
                  label="Pincode"
                  value={storePincode}
                  onChange={(e) => setStorePincode(e.target.value)}
                  placeholder="560038"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Btn disabled={isSaving} style={{ minWidth: "150px" }}>
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save General Details</span>
                  </>
                )}
              </Btn>
            </div>
          </form>
        )}

        {/* TAB 2: OPERATING HOURS */}
        {activeTab === 'hours' && (
          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Operating Hours</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Define opening and closing times for storefront order restrictions.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <Input
                label="Open Time"
                type="time"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
              />
              <Input
                label="Close Time"
                type="time"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Btn disabled={isSaving} style={{ minWidth: "150px" }}>
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Operating Hours</span>
                  </>
                )}
              </Btn>
            </div>
          </form>
        )}

        {/* TAB 3: TAXATION RULES */}
        {activeTab === 'tax' && (
          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Taxation Rules</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Configure CGST and SGST splits applied to table checkouts.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <Input
                  label="CGST Rate (%)"
                  type="number"
                  step="0.01"
                  value={cgst}
                  onChange={(e) => setCgst(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="SGST Rate (%)"
                  type="number"
                  step="0.01"
                  value={sgst}
                  onChange={(e) => setSgst(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div style={{
                background: "#fbfbf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer"
              }} onClick={() => setTaxInclusive(!taxInclusive)}>
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={() => {}} // toggled by container click
                  style={{
                    marginTop: "3px",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: T.ind
                  }}
                />
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: T.tx, marginBottom: "2px" }}>Tax Inclusive Pricing</p>
                  <p style={{ fontSize: "10px", color: T.mu, fontWeight: 500, lineHeight: "1.4" }}>
                    When enabled, menu catalog item prices include CGST and SGST calculations. If disabled, taxes are added on top of item totals.
                  </p>
                </div>
              </div>

              <div style={{
                background: "#fbfbf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                cursor: "pointer",
                marginTop: "12px"
              }} onClick={() => {
                if (serviceChargeType === 'none') {
                  setServiceChargeType('percent');
                  setServiceChargeValue(5.00); // default value
                } else {
                  setServiceChargeType('none');
                  setServiceChargeValue(0.00);
                }
              }}>
                <input
                  type="checkbox"
                  checked={serviceChargeType !== 'none'}
                  onChange={() => {}} // toggled by container click
                  style={{
                    marginTop: "3px",
                    width: "16px",
                    height: "16px",
                    cursor: "pointer",
                    accentColor: T.ind
                  }}
                />
                <div>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: T.tx, marginBottom: "2px" }}>Enable Service Charge</p>
                  <p style={{ fontSize: "10px", color: T.mu, fontWeight: 500, lineHeight: "1.4" }}>
                    When enabled, discretionary service charges are calculated and added to checkout bills. If disabled, service charges are omitted.
                  </p>
                </div>
              </div>

              {serviceChargeType !== 'none' && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "12px" }}>
                  <Sel
                    label="Charge Type"
                    value={serviceChargeType}
                    onChange={(e) => setServiceChargeType(e.target.value)}
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </Sel>
                  
                  <Input
                    label={serviceChargeType === 'flat' ? "Charge Value (₹)" : "Charge Value (%)"}
                    type="number"
                    step="0.01"
                    value={serviceChargeValue}
                    onChange={(e) => setServiceChargeValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Btn disabled={isSaving} style={{ minWidth: "150px" }}>
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Taxation Rules</span>
                  </>
                )}
              </Btn>
            </div>
          </form>
        )}

        {/* TAB 4: PAYMENT GATEWAY */}
        {activeTab === 'payments' && (
          <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Payment Gateway</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Setup API keys for online orders and UPI payments routing.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Sel
                label="Active Payment Gateway"
                value={activeGateway}
                onChange={(e) => setActiveGateway(e.target.value)}
              >
                <option value="razorpay">Razorpay Gateway (Standard)</option>
                <option value="phonepe">PhonePe Merchant PG</option>
                <option value="googlepay">GooglePay Business PG</option>
                <option value="paytm">Paytm Merchant PG</option>
                <option value="bharatpe">BharatPe QR Business</option>
              </Sel>

              {activeGateway === 'razorpay' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>Razorpay Configuration</span>
                  <Input
                    label="Razorpay Key ID"
                    value={razorpayKey}
                    onChange={(e) => setRazorpayKey(e.target.value)}
                    placeholder="rzp_test_..."
                  />
                </div>
              )}

              {activeGateway === 'phonepe' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>PhonePe Integration</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Input
                      label="Merchant ID"
                      value={phonepeMerchantId}
                      onChange={(e) => setPhonepeMerchantId(e.target.value)}
                      placeholder="M22... or PG..."
                    />
                    <Input
                      label="Terminal ID (Store ID)"
                      value={phonepeTerminalId}
                      onChange={(e) => setPhonepeTerminalId(e.target.value)}
                      placeholder="T22..."
                    />
                  </div>
                </div>
              )}

              {activeGateway === 'googlepay' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>GooglePay Integration</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Input
                      label="GooglePay Merchant ID"
                      value={googlepayMerchantId}
                      onChange={(e) => setGooglepayMerchantId(e.target.value)}
                      placeholder="gpay_merchant_..."
                    />
                    <Input
                      label="Terminal ID"
                      value={googlepayTerminalId}
                      onChange={(e) => setGooglepayTerminalId(e.target.value)}
                      placeholder="gpay_terminal_..."
                    />
                  </div>
                </div>
              )}

              {activeGateway === 'paytm' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>Paytm Integration</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Input
                      label="Paytm Merchant ID"
                      value={paytmMerchantId}
                      onChange={(e) => setPaytmMerchantId(e.target.value)}
                      placeholder="paytm_mid_..."
                    />
                    <Input
                      label="Terminal ID"
                      value={paytmTerminalId}
                      onChange={(e) => setPaytmTerminalId(e.target.value)}
                      placeholder="paytm_tid_..."
                    />
                  </div>
                </div>
              )}

              {activeGateway === 'bharatpe' && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px", background: "#fbfbf9", border: `1px solid ${T.bdr}`, borderRadius: "12px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: T.tx }}>BharatPe Integration</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Input
                      label="BharatPe Merchant ID"
                      value={bharatpeMerchantId}
                      onChange={(e) => setBharatpeMerchantId(e.target.value)}
                      placeholder="bharatpe_mid_..."
                    />
                    <Input
                      label="Terminal ID"
                      value={bharatpeTerminalId}
                      onChange={(e) => setBharatpeTerminalId(e.target.value)}
                      placeholder="bharatpe_tid_..."
                    />
                  </div>
                </div>
              )}

              <Input
                label="Fallback Store UPI ID"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="cafecanvas@okhdfcbank"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
              <Btn disabled={isSaving} style={{ minWidth: "150px" }}>
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Save Payment Keys</span>
                  </>
                )}
              </Btn>
            </div>
          </form>
        )}

        {/* TAB 5: MERCHANT PLAN */}
        {activeTab === 'subscription' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Subscription & Billing</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Review your tenant platform tier and licensing specifications.</p>
            </div>

            <div style={{
              background: "#fafaf9",
              border: `1px solid ${T.bdr}`,
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <span style={{ fontSize: "9px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: T.mu }}>Current Active Plan</span>
                <h5 style={{ fontSize: "20px", fontWeight: 800, color: T.ind, marginTop: "4px", textTransform: "capitalize" }}>
                  {subscriptionTier} License
                </h5>
                <p style={{ fontSize: "11px", color: T.mu2, fontWeight: 500, marginTop: "4px" }}>
                  Full multi-tenant administrative capabilities are enabled.
                </p>
              </div>
              <Btn onClick={handleOpenPricing} variant="ghost" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Change Plan</span>
                <ExternalLink size={12} />
              </Btn>
            </div>

            <div style={{
              fontSize: "11px",
              color: T.mu2,
              fontWeight: 500,
              lineHeight: "1.6",
              padding: "16px 20px",
              background: T.iA(0.05),
              border: `1px solid ${T.iA(0.12)}`,
              borderRadius: "12px"
            }}>
              🚀 Upgrade to the <strong style={{ color: T.ind }}>Growth</strong> or <strong style={{ color: T.ind }}>Enterprise</strong> tier to unlock multiple locations sync, daily automated SMS alerts via MSG91, advanced analytics reports exports, and detailed KDS performance metrics.
            </div>
          </div>
        )}

        {/* TAB 6: ACCOUNT SECURITY */}
        {activeTab === 'account' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Access Control</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Configure administrative security boundaries and password policies.</p>
            </div>

            {/* Password section */}
            <div>
              <Btn 
                onClick={() => window.open('https://cafecanvas.bar/forgot-password', '_blank')}
                variant="ghost"
              >
                Trigger Master Password Reset
              </Btn>
            </div>

            {/* Danger Zone */}
            <div style={{
              border: `1px solid ${T.rose}25`,
              background: `${T.rose}06`,
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <h5 style={{
                fontSize: "12px",
                fontWeight: 800,
                color: T.rose,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <AlertTriangle size={16} />
                Danger Zone
              </h5>
              <p style={{ fontSize: "11px", color: T.mu2, fontWeight: 500, lineHeight: "1.5" }}>
                Deactivating this café stops restaurant operations permanently. It voids all menus, tables, locations, billing logs, and cancels all customer and POS terminal sessions. This operation is permanent and cannot be undone.
              </p>
              <button
                onClick={() => {
                  const val = prompt('Type DEACTIVATE to confirm café closure:');
                  if (val === 'DEACTIVATE') {
                    alert('Tenant deactivation queue initiated. Please contact CafeCanvas support to finalize.');
                  }
                }}
                style={{
                  background: T.rose,
                  color: "#ffffff",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  width: "fit-content",
                  transition: "background 0.15s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#be123c"}
                onMouseLeave={(e) => e.currentTarget.style.background = T.rose}
              >
                Deactivate Café
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
