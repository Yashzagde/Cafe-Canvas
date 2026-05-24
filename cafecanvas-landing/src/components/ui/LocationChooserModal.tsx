"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Search, Compass, MapPin, Check, Loader2 } from "lucide-react";

interface LocationDetails {
  address: string;
  city: string;
  state?: string;
  lat?: number;
  lon?: number;
}

interface LocationChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: LocationDetails) => void;
  initialCity?: string;
  initialAddress?: string;
}

const popularCities = [
  "Mumbai",
  "Pune",
  "Bangalore",
  "Delhi",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Goa"
];

export default function LocationChooserModal({
  isOpen,
  onClose,
  onConfirm,
  initialCity = "",
  initialAddress = ""
}: LocationChooserModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialAddress || initialCity);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");

  // Default coordinate focused on India (Nagpur/central India coordinates as default start)
  const [coordinates, setCoordinates] = useState({ lat: 21.1458, lon: 79.0882 });
  const [zoom, setZoom] = useState(5);

  useEffect(() => {
    if (isOpen) {
      if (initialAddress) {
        setSearchQuery(initialAddress);
        handleSearch(initialAddress);
      } else if (initialCity) {
        setSearchQuery(initialCity);
        handleSearch(initialCity);
      }
    }
  }, [isOpen, initialCity, initialAddress]);

  if (!isOpen) return null;

  const handleSearch = async (queryStr: string = searchQuery) => {
    if (!queryStr.trim()) return;
    setLoading(true);
    setError("");
    setSuggestions([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          queryStr
        )}&addressdetails=1&limit=5`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setSuggestions(data);
      } else {
        setError("No locations found. Try adjusting your search term.");
      }
    } catch (err) {
      console.error("Nominatim search failed:", err);
      setError("Failed to search location. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    setCoordinates({ lat, lon });
    setZoom(16);
    setSuggestions([]);
    setSearchQuery(item.display_name);

    const addr = item.address || {};
    const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || "";
    const state = addr.state || "";

    setSelectedLocation({
      address: item.display_name,
      city,
      state,
      lat,
      lon
    });
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setDetecting(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          setZoom(16);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data) {
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.village || addr.state_district || addr.county || "";
            const state = addr.state || "";

            setSearchQuery(data.display_name);
            setSelectedLocation({
              address: data.display_name,
              city,
              state,
              lat: latitude,
              lon: longitude
            });
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
          setError("Failed to resolve your coordinates to an address.");
        } finally {
          setDetecting(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve location. Please check browser permissions.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleCityTagClick = (cityName: string) => {
    setSearchQuery(`${cityName}, India`);
    handleSearch(`${cityName}, India`);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onConfirm(selectedLocation);
      onClose();
    } else {
      // Fallback: If they haven't explicitly clicked a suggestion but typed something
      onConfirm({
        address: searchQuery,
        city: searchQuery.split(",")[0].trim(),
        lat: coordinates.lat,
        lon: coordinates.lon
      });
      onClose();
    }
  };

  // Safe parameters for OpenStreetMap embed iframe
  const bboxOffset = 0.005;
  const lonMin = coordinates.lon - bboxOffset;
  const latMin = coordinates.lat - bboxOffset;
  const lonMax = coordinates.lon + bboxOffset;
  const latMax = coordinates.lat + bboxOffset;
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lonMin}%2C${latMin}%2C${lonMax}%2C${latMax}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lon}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl bg-[#0d1220] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-bold text-white">Choose Restaurant Location</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Geolocation and search controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Enter city, area, or road name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-white placeholder-white/30"
                />
                {loading ? (
                  <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-green-500 animate-spin" />
                ) : (
                  <button
                    onClick={() => handleSearch()}
                    className="absolute right-3 top-2.5 p-1 text-white/40 hover:text-white cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleDetectLocation}
                disabled={detecting}
                className="px-4 py-2.5 bg-green-600/10 hover:bg-green-600/20 border border-green-500/20 text-green-400 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {detecting ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <Compass className="w-4.5 h-4.5" />
                )}
                {detecting ? "Locating..." : "GPS Detect"}
              </button>
            </div>

            {/* Indian popular cities quick selectors */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider self-center mr-1">
                Popular:
              </span>
              {popularCities.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCityTagClick(c)}
                  className="text-[10px] px-2.5 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-full text-white/60 hover:text-white transition-all cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <p className="text-xs text-orange-400 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              {error}
            </p>
          )}

          {/* Suggestions Dropdown (Floating style inside modal body) */}
          {suggestions.length > 0 && (
            <div className="border border-white/10 bg-[#0d1220] rounded-xl overflow-hidden divide-y divide-white/5">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full p-3 text-left hover:bg-white/[0.04] transition-colors flex items-start gap-3 cursor-pointer text-xs text-white/80"
                >
                  <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">{item.display_name.split(",")[0]}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{item.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Interactive Map Visual */}
          <div className="w-full h-64 bg-slate-950/40 rounded-xl overflow-hidden border border-white/[0.08] relative">
            <iframe
              title="Location selector map"
              src={mapUrl}
              className="w-full h-full border-0 grayscale invert brightness-90 contrast-125 opacity-80"
              loading="lazy"
            />
            {/* Visual overlay indicator */}
            <div className="absolute top-3 left-3 bg-black/60 px-2 py-1 rounded text-[9px] tracking-wide text-white/60 font-mono pointer-events-none select-none border border-white/5">
              LAT: {coordinates.lat.toFixed(4)} / LON: {coordinates.lon.toFixed(4)}
            </div>
          </div>

          {/* Selected address confirmation text */}
          {selectedLocation && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-start gap-2.5">
              <Check className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-bold text-green-400 uppercase tracking-wider">
                  Confirmed Selection
                </p>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  {selectedLocation.address}
                </p>
                {selectedLocation.city && (
                  <p className="text-[10px] text-white/45 mt-1 font-semibold">
                    City: {selectedLocation.city} {selectedLocation.state ? `(${selectedLocation.state})` : ""}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#080b15] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-green-950/30 hover:shadow-green-800/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center gap-1.5"
          >
            Apply Location
          </button>
        </div>
      </motion.div>
    </div>
  );
}
