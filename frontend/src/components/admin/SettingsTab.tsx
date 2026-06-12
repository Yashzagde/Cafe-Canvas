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
  Loader2,
  Copy,
  Check,
  Coffee,
  LogOut,
  HelpCircle
} from 'lucide-react';
import { T, ff, Btn, Input, Sel } from '@/components/admin/UIPrimitives';
import { getSettingsAction, updateGeneralSettingsAction, updateStoreSettingsAction } from '@/app/admin/actions/settings.actions';
import { createClient } from '@/utils/supabase/client';

const InputAny = Input as any;

type TabType = 'general' | 'hours' | 'tax' | 'payments' | 'subscription' | 'legal' | 'guide';

interface SettingsTabProps {
  toast: (msg: string, type?: "success" | "error" | "warning") => void;
  tenantName: string;
  setTenantName: React.Dispatch<React.SetStateAction<string>>;
  setTenantLogoUrl?: React.Dispatch<React.SetStateAction<string | null>>;
  onLogout?: () => void;
}

export default function SettingsTab({ toast, tenantName, setTenantName, setTenantLogoUrl, onLogout }: SettingsTabProps) {
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

  // Tenant ID states
  const [tenantId, setTenantId] = useState('');
  const [publicId, setPublicId] = useState('');
  const [copiedPrivate, setCopiedPrivate] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  const copyToClipboard = (text: string, type: 'private' | 'public') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'private') {
        setCopiedPrivate(true);
        setTimeout(() => setCopiedPrivate(false), 2000);
      } else {
        setCopiedPublic(true);
        setTimeout(() => setCopiedPublic(false), 2000);
      }
      toast('📋 Copied to clipboard!', 'success');
    }
  };

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

  // WebUSB terminal state
  const [connectedUsbDevices, setConnectedUsbDevices] = useState<any[]>([]);

  useEffect(() => {
    const nav = navigator as any;
    if (typeof navigator !== 'undefined' && nav.usb) {
      nav.usb.getDevices().then((devices: any[]) => {
        setConnectedUsbDevices(devices);
      });
      const handleConnect = (e: any) => {
        setConnectedUsbDevices(prev => {
          if (prev.some(d => d.serialNumber === e.device.serialNumber)) return prev;
          return [...prev, e.device];
        });
      };
      const handleDisconnect = (e: any) => {
        setConnectedUsbDevices(prev => prev.filter(d => d.serialNumber !== e.device.serialNumber));
      };
      nav.usb.addEventListener('connect', handleConnect);
      nav.usb.addEventListener('disconnect', handleDisconnect);
      return () => {
        nav.usb.removeEventListener('connect', handleConnect);
        nav.usb.removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, []);

  const requestUsbDevice = async () => {
    const nav = navigator as any;
    if (typeof navigator !== 'undefined' && nav.usb) {
      try {
        const device = await nav.usb.requestDevice({ filters: [] });
        setConnectedUsbDevices(prev => {
          if (prev.some(d => d.serialNumber === device.serialNumber)) return prev;
          return [...prev, device];
        });
        toast(`🔌 Connected to ${device.productName || 'USB Terminal'}`, 'success');
      } catch (err: any) {
        console.error('WebUSB connection error:', err);
      }
    } else {
      toast('WebUSB API is not supported by your browser.', 'error');
    }
  };

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
        setTenantId(tenant.id || '');
        setPublicId(tenant.public_id || '');

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
    { id: 'legal' as TabType, label: 'Legal Policies', icon: ShieldCheck },
    { id: 'guide' as TabType, label: 'User Guide', icon: HelpCircle }
  ];

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-20 gap-5 text-[#1c1917]">
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-stone-200 border-t-[#d97706] animate-spin absolute" />
          <Coffee className="w-5 h-5 text-[#d97706]" />
        </div>
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

        <div style={{ margin: "8px 0", borderTop: `1px solid ${T.bdr}` }} />
        
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to log out of your session?')) {
              onLogout?.();
            }
          }}
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
            background: "transparent",
            color: "#ef4444",
            textAlign: "left"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          <span>Logout Session</span>
        </button>
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

              {/* WebUSB Connected Terminal Status */}
              <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px", 
                padding: "16px", 
                background: connectedUsbDevices.length > 0 ? "rgba(34, 197, 94, 0.05)" : "#fafaf9", 
                border: `1px solid ${connectedUsbDevices.length > 0 ? "rgba(34, 197, 94, 0.3)" : T.bdr}`, 
                borderRadius: "16px", 
                marginTop: "4px" 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ 
                      width: "8px", 
                      height: "8px", 
                      borderRadius: "50%", 
                      background: connectedUsbDevices.length > 0 ? "#22c55e" : "#a8a29e",
                      boxShadow: connectedUsbDevices.length > 0 ? "0 0 8px #22c55e" : "none"
                    }} />
                    <span style={{ fontSize: "12px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em" }}>
                      {connectedUsbDevices.length > 0 ? "PAYMENT MACHINE CONNECTED" : "NO HARDWARE TERMINAL LINKED"}
                    </span>
                  </div>
                  {connectedUsbDevices.length === 0 && (
                    <button 
                      type="button" 
                      onClick={requestUsbDevice}
                      style={{ 
                        fontSize: "10px", 
                        fontWeight: 700, 
                        color: T.ind, 
                        background: "none", 
                        border: "none", 
                        cursor: "pointer",
                        textDecoration: "underline"
                      }}
                    >
                      Connect USB Device
                    </button>
                  )}
                </div>
                
                {connectedUsbDevices.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ fontSize: "11px", color: T.tx, fontWeight: 600 }}>
                      Device: {connectedUsbDevices[0].productName || "Generic USB Card Terminal"}
                    </div>
                    <div style={{ fontSize: "10px", color: T.mu, fontWeight: 500, fontFamily: "monospace" }}>
                      Vendor ID: 0x{connectedUsbDevices[0].vendorId.toString(16)} | Product ID: 0x{connectedUsbDevices[0].productId.toString(16)}
                    </div>
                    <div style={{ fontSize: "10px", color: T.mu, fontWeight: 500 }}>
                      Channel status: Connected & active for {activeGateway.toUpperCase()} transaction settlements.
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: "10px", color: T.mu, fontWeight: 500 }}>
                    Please connect your Paytm/PhonePe/BharatPe card machine via USB cable or OTG to configure local settlement sync.
                  </span>
                )}
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

        {/* TAB 6: LEGAL POLICIES */}
        {activeTab === 'legal' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Platform Legal Policies</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Review the binding Terms of Service and Privacy Policy for the CafeCanvas SaaS Platform.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              {/* Privacy Policy Box */}
              <div style={{
                background: "#fafaf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                height: "400px",
                overflowY: "auto"
              }}>
                <h5 style={{ fontSize: "12px", fontWeight: 800, color: T.tx }}>Privacy Policy</h5>
                <div style={{ fontSize: "10px", color: T.mu2, lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {`Welcome to CafeCanvas. We value diner and tenant privacy. 

                  1. DATA ISOLATION & RLS
                  All data is logically partitioned in the database via tenant_id. Supabase Row-Level Security (RLS) policies prevent unauthorized cross-tenant read/write queries.
                  
                  2. INFORMATION COLLECTED
                  - Diner name and mobile number (verified via SMS OTP).
                  - Order details, check-in table sessions, and invoice totals.
                  - Staff names, emails, roles, and access PIN hashes.
                  
                  3. INTEGRATIONS & HARDWARE
                  - Razorpay credentials are encrypted at rest. We do not store credit card numbers.
                  - Receipts are compiled locally and printed to thermal devices (WebUSB/BLE).
                  
                  4. COMPLIANCE & ACCURACY
                  - Tax configuration maps SGST/CGST splits.
                  - Financial transactions resolve as integer paise (₹1 = 100 paise) to prevent floating-point inaccuracies.`}
                </div>
              </div>

              {/* Terms of Service Box */}
              <div style={{
                background: "#fafaf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                height: "400px",
                overflowY: "auto"
              }}>
                <h5 style={{ fontSize: "12px", fontWeight: 800, color: T.tx }}>Terms of Service</h5>
                <div style={{ fontSize: "10px", color: T.mu2, lineHeight: "1.6", whiteSpace: "pre-line" }}>
                  {`These Terms govern the use of the CafeCanvas Platform.

                  1. PLATFORM LICENSE
                  CafeCanvas grants you a revocable, non-exclusive license to use the Store Admin, Staff POS, and customer storefronts.
                  
                  2. MULTI-TENANT BOUNDARIES
                  You agree not to bypass, reverse engineer, or exploit database isolation policies. Unauthorized role-escalation attempts will result in account suspension.
                  
                  3. CUSTOMER DATA CONSENT
                  You warrant that you have obtained proper Diner consent to collect names and phone numbers for checkout tax routing and GST compliance.
                  
                  4. INTEGRATIONS
                  SaaS settlements route directly via Razorpay. We are not liable for transaction processing delays or gateway failures.
                  
                  5. GOVERNING LAW
                  These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.`}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: USER GUIDE */}
        {activeTab === 'guide' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 800, color: T.tx, letterSpacing: "-0.01em", marginBottom: "4px" }}>Store Operations User Guide</h4>
              <p style={{ fontSize: "11px", color: T.mu, fontWeight: 500 }}>Step-by-step documentation for Store Admin operations, Staff POS (APK), and Customer Storefront.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Store Admin Section */}
              <div style={{
                background: "#fafaf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <h5 style={{ fontSize: "13px", fontWeight: 800, color: T.tx, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🖥️</span> Store Admin Panel
                </h5>
                <div style={{ fontSize: "11px", color: T.mu2, lineHeight: "1.6" }}>
                  <strong>Overview:</strong> Managed via standard Web browsers or the Electron app. Owners/Managers configure the menu catalog, tables, taxes, and payment gateways.
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li><strong>Paise Resolution:</strong> All items are priced in base decimal Rupees, but processed in integers as paise in the database (e.g. ₹10.00 = 1000 paise) to prevent floating-point calculation errors.</li>
                    <li><strong>Table QRs:</strong> Generate and print dynamic vector QR table cards mapping to your storefront subdomain to trigger dine-in table ordering.</li>
                    <li><strong>Local Printing:</strong> Pair receipt printer devices directly using the <strong>WebUSB API</strong> under Settings (compatible with standard 80mm/58mm thermal units).</li>
                  </ul>
                </div>
              </div>

              {/* Staff POS Section */}
              <div style={{
                background: "#fafaf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <h5 style={{ fontSize: "13px", fontWeight: 800, color: T.tx, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>📱</span> Staff Mobile POS (APK) & Web POS
                </h5>
                <div style={{ fontSize: "11px", color: T.mu2, lineHeight: "1.6" }}>
                  <strong>Overview:</strong> Dedicated mobile app built for Android tablets and smartphones to help waiter staff take orders, track table sessions, and print receipt bills.
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li><strong>Table Sessions:</strong> Cashiers/waiters can start, modify, and check out table sessions in real-time, moving tables from 🟢 Available to 🔴 Occupied.</li>
                    <li><strong>KDS Workflow:</strong> Orders route to the Kitchen Display System (KDS) immediately, moving items through <code>pending</code> ➔ <code>confirmed</code> ➔ <code>preparing</code> ➔ <code>served</code>.</li>
                    <li><strong>Printer Connectivity:</strong> Prints invoices wirelessly using <strong>Bluetooth Low Energy (BLE)</strong> or local network protocols without driver dependencies.</li>
                  </ul>
                </div>
              </div>

              {/* Storefront Section */}
              <div style={{
                background: "#fafaf9",
                border: `1px solid ${T.bdr}`,
                borderRadius: "16px",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}>
                <h5 style={{ fontSize: "13px", fontWeight: 800, color: T.tx, display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>🏪</span> Customer Storefront (Dine-in Web)
                </h5>
                <div style={{ fontSize: "11px", color: T.mu2, lineHeight: "1.6" }}>
                  <strong>Overview:</strong> Customer-facing Next.js digital menu. Allows diners to self-check-in, view catalog menus, select items, and process online settlements.
                  <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "6px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <li><strong>Dine-In OTP:</strong> Customer scans the table QR code, inputs their name/number, and verifies check-in via SMS OTP (routed via MSG91 SMS API).</li>
                    <li><strong>Online Payments:</strong> Diners pay directly using UPI, NetBanking, or card payment settlements routed through your integrated <strong>Razorpay</strong> merchant account.</li>
                    <li><strong>Brand Story & Blogs:</strong> Displays customized brand story narratives and promotional articles published from the Storefront Experience Editor.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
