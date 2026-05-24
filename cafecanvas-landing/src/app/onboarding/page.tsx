"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, OnboardingDetails } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Compass } from "lucide-react";
import LocationChooserModal from "@/components/ui/LocationChooserModal";

export default function OnboardingPage() {
  const { user, profile, loading, submitOnboarding } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "Restaurant",
    ownerName: "",
    phone: "",
    email: "",
    gstNumber: "",
    address: "",
    cityState: "",
    outletsCount: 1,
    staffSize: 5,
  });

  // Prefill email if logged in
  useEffect(() => {
    if (user && user.email && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || "",
        ownerName: user.displayName || "",
      }));
    }
  }, [user]);

  // Redirect logic: if not logged in, go to auth. If already onboarded, go to dashboard.
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth");
      } else if (profile && profile.onboarded) {
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "outletsCount" || name === "staffSize" ? Number(value) : value,
    }));
  };

  const handleLocationConfirm = (details: { address: string; city: string; state?: string }) => {
    const cityStateVal = details.city && details.state 
      ? `${details.city}, ${details.state}`
      : details.city || details.state || "";

    setFormData((prev) => ({
      ...prev,
      address: details.address,
      cityState: cityStateVal
    }));
  };

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.ownerName || !formData.phone || !formData.email) {
        setError("Please fill in all personal contact details.");
        return;
      }
    } else if (step === 2) {
      if (!formData.businessName || !formData.businessType) {
        setError("Please enter your business name and select a business type.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Final validation
    if (!formData.address || !formData.cityState) {
      setError("Please fill in your business location details.");
      return;
    }

    setSaving(true);
    try {
      const details: OnboardingDetails = {
        businessName: formData.businessName,
        businessType: formData.businessType,
        ownerName: formData.ownerName,
        phone: formData.phone,
        email: formData.email,
        gstNumber: formData.gstNumber || "N/A",
        address: formData.address,
        cityState: formData.cityState,
        outletsCount: formData.outletsCount,
        staffSize: formData.staffSize,
      };

      await submitOnboarding(details);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to save onboarding details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user || (profile && profile.onboarded)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stepsTotal = 3;
  const progressPercent = (step / stepsTotal) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center mb-4">
          <span className="text-2xl font-black text-gray-950">
            Cafe<span className="text-orange-500">Canvas</span>
          </span>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Setup Your Workspace
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Configure your hospitality operation system in minutes.
        </p>

        {/* Progress Tracker */}
        <div className="mt-6 px-4 sm:px-0">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-500 mb-2">
            <span>STEP {step} OF 3</span>
            <span>{Math.round(progressPercent)}% COMPLETE</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-orange-500"
              initial={{ width: "0%" }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-400">
            <span className={step >= 1 ? "text-orange-600 font-medium" : ""}>1. Profile</span>
            <span className={step >= 2 ? "text-orange-600 font-medium" : ""}>2. Business</span>
            <span className={step >= 3 ? "text-orange-600 font-medium" : ""}>3. Operations</span>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-100 sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                  Owner & Primary Contact Details
                </h3>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-semibold text-gray-800">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    required
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-800">
                    Mobile Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                    Operational Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="manager@mybusiness.com"
                  />
                </div>

                <div className="pt-4">
                  <button
                    onClick={nextStep}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition cursor-pointer"
                  >
                    Continue to Business Info
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                  Business Setup & Branding
                </h3>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-800">
                    Business / Brand Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="e.g. Cafe Blue, The Social Pub"
                  />
                </div>

                <div>
                  <label htmlFor="businessType" className="block text-sm font-semibold text-gray-800">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white text-gray-900"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Bar / Lounge">Bar / Lounge</option>
                    <option value="Pub / Brewery">Pub / Brewery</option>
                    <option value="Club">Club</option>
                    <option value="Cloud Kitchen">Cloud Kitchen</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="outletsCount" className="block text-sm font-semibold text-gray-800">
                      Total Outlets
                    </label>
                    <input
                      type="number"
                      id="outletsCount"
                      name="outletsCount"
                      min={1}
                      required
                      value={formData.outletsCount}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="staffSize" className="block text-sm font-semibold text-gray-800">
                      Total Staff Size
                    </label>
                    <input
                      type="number"
                      id="staffSize"
                      name="staffSize"
                      min={1}
                      required
                      value={formData.staffSize}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={prevStep}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={nextStep}
                    className="flex-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition cursor-pointer"
                  >
                    Continue to Verification
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2 border-gray-100">
                  Verification & Business Address
                </h3>

                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-semibold text-gray-800">
                    GSTIN (GST Number)
                  </label>
                  <input
                    type="text"
                    id="gstNumber"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="22AAAAA0000A1Z5 (Optional)"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-800">
                      Street Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLocationModal(true)}
                      className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Choose on Map
                    </button>
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="Floor, building, sector, street name"
                  />
                </div>

                <div>
                  <label htmlFor="cityState" className="block text-sm font-semibold text-gray-800">
                    City & State
                  </label>
                  <input
                    type="text"
                    id="cityState"
                    name="cityState"
                    required
                    value={formData.cityState}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm text-gray-900"
                    placeholder="e.g. Pune, Maharashtra"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={prevStep}
                    disabled={saving}
                    className="flex-1 py-2.5 px-4 border border-gray-300 rounded-md text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex-2 flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition cursor-pointer"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Initializing Workspace...
                      </span>
                    ) : (
                      "Complete Onboarding"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <LocationChooserModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onConfirm={handleLocationConfirm}
        initialAddress={formData.address}
        initialCity={formData.cityState ? formData.cityState.split(",")[0].trim() : ""}
      />
    </div>
  );
}
