"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ShieldCheck,
  Truck,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Package,
  Clock,
  Calendar,
  Info,
  ShoppingBag,
  Plus,
  X,
  Sparkles,
  User,
  MapPin,
  Navigation,
  Map,
  Search,
  Phone,
  Mail,
  Home,
  ChevronRight,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/lib/cart-store";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type CheckoutStep = "info" | "delivery" | "confirm" | "complete";

type DeliveryMode = "self" | "other";

interface LatLng {
  lat: number;
  lng: number;
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────
const BANGLADESH_DISTRICTS = [
  { id: "Dhaka", bn: "ঢাকা", en: "Dhaka" },
  { id: "Gazipur", bn: "গাজীপুর", en: "Gazipur" },
  { id: "Narayanganj", bn: "নারায়ণগঞ্জ", en: "Narayanganj" },
  { id: "Chattogram", bn: "চট্টগ্রাম", en: "Chattogram" },
  { id: "Sylhet", bn: "সিলেট", en: "Sylhet" },
  { id: "Bogura", bn: "বগুড়া", en: "Bogura" },
  { id: "Dinajpur", bn: "দিনাজপুর", en: "Dinajpur" },
  { id: "Rajshahi", bn: "রাজশাহী", en: "Rajshahi" },
  { id: "Khulna", bn: "খুলনা", en: "Khulna" },
  { id: "Barishal", bn: "বরিশাল", en: "Barishal" },
  { id: "Cumilla", bn: "কুমিল্লা", en: "Cumilla" },
  { id: "Mymensingh", bn: "ময়মনসিংহ", en: "Mymensingh" },
  { id: "Rangpur", bn: "রংপুর", en: "Rangpur" },
  { id: "Cox's Bazar", bn: "কক্সবাজার", en: "Cox's Bazar" },
  { id: "Brahmanbaria", bn: "ব্রাহ্মণবাড়িয়া", en: "Brahmanbaria" },
  { id: "Jessore", bn: "যশোর", en: "Jessore" },
  { id: "Pabna", bn: "পাবনা", en: "Pabna" },
  { id: "Tangail", bn: "টাঙ্গাইল", en: "Tangail" },
  { id: "Sirajganj", bn: "সিরাজগঞ্জ", en: "Sirajganj" },
  { id: "Faridpur", bn: "ফরিদপুর", en: "Faridpur" },
  { id: "Kushtia", bn: "কুষ্টিয়া", en: "Kushtia" },
  { id: "Noakhali", bn: "নোয়াখালী", en: "Noakhali" },
  { id: "Feni", bn: "ফেনী", en: "Feni" },
  { id: "Narsingdi", bn: "নরসিংদী", en: "Narsingdi" },
  { id: "Munshiganj", bn: "মুন্সিগঞ্জ", en: "Munshiganj" },
  { id: "Manikganj", bn: "মানিকগঞ্জ", en: "Manikganj" },
];

// ─────────────────────────────────────────────────────────────
// Leaflet Map Component (dynamic, client-only)
// ─────────────────────────────────────────────────────────────
interface MapPickerProps {
  center: LatLng;
  onLocationSelect: (latlng: LatLng, address: Partial<AddressForm>) => void;
  locale: string;
}

interface AddressForm {
  district: string;
  thana: string;
  village: string;
  address: string;
}

function MapPicker({ center, onLocationSelect, locale }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number): Promise<Partial<AddressForm>> => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${locale === "bn" ? "bn,en" : "en"}`
        );
        const data = await res.json();
        const addr = data.address || {};
        return {
          district:
            addr.county ||
            addr.city_district ||
            addr.state_district ||
            addr.city ||
            "",
          thana:
            addr.suburb || addr.neighbourhood || addr.town || addr.village || "",
          village: addr.road || addr.quarter || "",
          address: data.display_name ? data.display_name.split(",")[0] : "",
        };
      } catch {
        return {};
      }
    },
    [locale]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default icon paths
      // @ts-ignore
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([center.lat, center.lng], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom pin marker with pulse animation
      const pulseIcon = L.divIcon({
        className: "",
        html: `<div class="map-pin-wrapper">
          <div class="map-pin-pulse"></div>
          <div class="map-pin-dot"></div>
        </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([center.lat, center.lng], {
        icon: pulseIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", async () => {
        const pos = marker.getLatLng();
        const addr = await reverseGeocode(pos.lat, pos.lng);
        onLocationSelect({ lat: pos.lat, lng: pos.lng }, addr);
      });

      map.on("click", async (e: any) => {
        marker.setLatLng(e.latlng);
        const addr = await reverseGeocode(e.latlng.lat, e.latlng.lng);
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng }, addr);
      });

      mapRef.current = map;
      markerRef.current = marker;
      setIsMapReady(true);
    });

    // Inject Leaflet CSS
    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && isMapReady) {
      mapRef.current.setView([center.lat, center.lng], 15, { animate: true });
      markerRef.current.setLatLng([center.lat, center.lng]);
    }
  }, [center, isMapReady]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + " Bangladesh")}&limit=5&accept-language=en`
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0]);

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }

    const addr = await reverseGeocode(lat, lng);
    onLocationSelect({ lat, lng }, addr);
  };

  return (
    <div className="map-picker-container">
      {/* Search Bar */}
      <div className="map-search-bar">
        <div className="map-search-input-wrap">
          <Search className="map-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder={
              locale === "bn"
                ? "জায়গার নাম বা ঠিকানা লিখুন..."
                : "Search location or address..."
            }
            className="map-search-input"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="map-search-btn"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span>{locale === "bn" ? "খুঁজুন" : "Search"}</span>
            )}
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="map-search-results">
            {searchResults.map((result, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(result)}
                className="map-search-result-item"
              >
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="text-left text-xs">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="map-canvas-wrap">
        {!isMapReady && (
          <div className="map-loading-overlay">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-2">
              {locale === "bn" ? "ম্যাপ লোড হচ্ছে..." : "Loading map..."}
            </p>
          </div>
        )}
        <div ref={mapContainerRef} className="map-canvas" />
      </div>

      <p className="map-hint">
        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
        {locale === "bn"
          ? "ম্যাপে ক্লিক করুন বা পিন টেনে ডেলিভারি পয়েন্ট নির্ধারণ করুন"
          : "Click on the map or drag the pin to set delivery point"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────────────────────
const STEPS = [
  { key: "info", icon: User, labelBn: "আপনার তথ্য", labelEn: "Your Info" },
  {
    key: "delivery",
    icon: MapPin,
    labelBn: "ডেলিভারি ঠিকানা",
    labelEn: "Delivery",
  },
  { key: "confirm", icon: CreditCard, labelBn: "নিশ্চিত করুন", labelEn: "Confirm" },
];

function StepIndicator({
  currentStep,
  locale,
}: {
  currentStep: CheckoutStep;
  locale: string;
}) {
  const stepOrder: CheckoutStep[] = ["info", "delivery", "confirm", "complete"];
  const currentIdx = stepOrder.indexOf(currentStep);

  return (
    <div className="step-indicator">
      {STEPS.map((step, idx) => {
        const StepIcon = step.icon;
        const isDone = idx < currentIdx;
        const isActive = idx === currentIdx;

        return (
          <React.Fragment key={step.key}>
            <div className="step-item">
              <div
                className={cn(
                  "step-circle",
                  isDone && "step-circle-done",
                  isActive && "step-circle-active"
                )}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "step-label",
                  isActive && "step-label-active",
                  isDone && "step-label-done"
                )}
              >
                {locale === "bn" ? step.labelBn : step.labelEn}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn("step-connector", isDone && "step-connector-done")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Checkout Component
// ─────────────────────────────────────────────────────────────
function CheckoutContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const { locale, formatPrice } = useLanguage();
  const {
    items,
    buyNowItem,
    clearBuyNowItem,
    removeItem,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    clearCart,
    submitOrder,
  } = useCartStore();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("info");
  const [isProcessing, setIsProcessing] = useState(false);

  // Direct buy
  const isDirectBuy = mode === "direct" && Boolean(buyNowItem);
  const [mergedCartItemIds, setMergedCartItemIds] = useState<string[]>([]);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const mergedItems = isDirectBuy
    ? items.filter((it) => mergedCartItemIds.includes(it.id))
    : [];
  const unmergedCartItems = isDirectBuy
    ? items.filter((it) => !mergedCartItemIds.includes(it.id))
    : [];
  const checkoutItems =
    isDirectBuy && buyNowItem ? [buyNowItem, ...mergedItems] : items;

  // Customer info (Step 1)
  const [customerInfo, setCustomerInfo] = useState({
    fullName: "Rafiq Ahmed",
    phone: "01712-345678",
    email: "rafiq.ahmed@example.com",
  });

  // Delivery mode: "self" = deliver to current location, "other" = different location via map
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("self");

  // Delivery address (Step 2)
  const [deliveryAddress, setDeliveryAddress] = useState({
    district: "Dhaka",
    thana: "Dhanmondi",
    village: "Dhanmondi R/A",
    address: "House 42, Road 7/A",
    specialNote: "Please pack with extra ice care.",
    preferredDate: "",
    preferredTime: "",
    deliveryNote: "",
  });

  // GPS / Map state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState("");
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [mapCenter, setMapCenter] = useState<LatLng>({
    lat: 23.8103,
    lng: 90.4125,
  }); // Dhaka default
  const [pinnedLocation, setPinnedLocation] = useState<LatLng | null>(null);

  // Pre-order
  const [isPreOrder, setIsPreOrder] = useState(false);
  const todayStr = new Date().toISOString().split("T")[0];

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<"BKASH" | "NAGAD" | "COD">("BKASH");
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Cost calculation
  const subtotal = checkoutItems.reduce(
    (acc, it) => acc + it.unitPrice * it.quantity,
    0
  );
  const discount =
    isDirectBuy && mergedItems.length === 0 ? 0 : getDiscountAmount();
  const deliveryFee =
    subtotal >= 1500 ? 0 : isDirectBuy ? 60 : getDeliveryFee();
  const grandTotal = Math.max(0, subtotal - discount + deliveryFee);

  useEffect(() => {
    if (isPreOrder && paymentMethod === "COD") {
      setPaymentMethod("BKASH");
    }
  }, [isPreOrder, paymentMethod]);

  // ── GPS: use current location ──
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(
        locale === "bn"
          ? "এই ব্রাউজার GPS সাপোর্ট করে না।"
          : "Geolocation not supported by this browser."
      );
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMapCenter({ lat, lng });
        setPinnedLocation({ lat, lng });
        setGpsSuccess(true);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          locale === "bn"
            ? "লোকেশন অনুমতি দিন (অথবা নিচে ঠিকানা লিখুন)।"
            : "Please allow location access (or type address below)."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ── Map pin selected ──
  const handleLocationSelect = useCallback(
    (latlng: LatLng, addr: Partial<AddressForm>) => {
      setPinnedLocation(latlng);
      setDeliveryAddress((prev) => ({
        ...prev,
        district: addr.district || prev.district,
        thana: addr.thana || prev.thana,
        village: addr.village || prev.village,
        address: addr.address || prev.address,
      }));
    },
    []
  );

  // ── Step navigation ──
  const goNext = () => {
    const order: CheckoutStep[] = ["info", "delivery", "confirm", "complete"];
    const idx = order.indexOf(currentStep);
    if (idx < order.length - 1) {
      setCurrentStep(order[idx + 1] as CheckoutStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goBack = () => {
    const order: CheckoutStep[] = ["info", "delivery", "confirm", "complete"];
    const idx = order.indexOf(currentStep);
    if (idx > 0) {
      setCurrentStep(order[idx - 1] as CheckoutStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Place order ──
  const handleFinalOrder = async () => {
    if (isPreOrder && paymentMethod === "COD") {
      alert(
        locale === "bn"
          ? "প্রি-অর্ডারে ক্যাশ অন ডেলিভারি অফ।"
          : "COD unavailable for pre-orders."
      );
      return;
    }
    setIsProcessing(true);
    try {
      const orderPayload = {
        customer: {
          ...customerInfo,
          ...deliveryAddress,
          city: deliveryAddress.district,
          area: deliveryAddress.thana,
          deliveryMode,
          pinnedLocation,
        },
        paymentMethod,
        items: checkoutItems,
        subtotal,
        discount,
        deliveryFee,
        grandTotal,
        date: new Date().toISOString(),
      };

      const res = await submitOrder(orderPayload);
      if (res.success) {
        setPlacedOrder({ orderNumber: res.orderNumber, ...orderPayload });
        setCurrentStep("complete");
        if (isDirectBuy) {
          clearBuyNowItem();
          mergedCartItemIds.forEach((id) => removeItem(id));
        } else {
          clearCart();
        }
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // COMPLETE SCREEN
  // ─────────────────────────────────────────────────────────────
  if (currentStep === "complete" && placedOrder) {
    return (
      <div className="container-narrow py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-linen p-10 md:p-14 border border-border space-y-6 max-w-xl mx-auto"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto ring-4 ring-primary/10">
            <CheckCircle2 className="w-10 h-10 stroke-1" />
          </div>
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-primary">
            {locale === "bn" ? "অর্ডার নিশ্চিতকরণ" : "Order Confirmed"}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl text-foreground">
            {locale === "bn"
              ? "ধন্যবাদ, আপনার অর্ডার গৃহীত হয়েছে"
              : "Thank You For Your Order"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {locale === "bn"
              ? `অর্ডার নম্বর #${placedOrder.orderNumber}। আমাদের ডেলিভারি প্রতিনিধি শীঘ্রই যোগাযোগ করবেন।`
              : `Order #${placedOrder.orderNumber}. Our delivery team will be in touch soon.`}
          </p>

          <div className="border-t border-border pt-6 text-left text-xs space-y-2 text-muted-foreground">
            <div className="flex justify-between">
              <span>{locale === "bn" ? "প্রাপক:" : "Recipient:"}</span>
              <span className="text-foreground font-medium">
                {placedOrder.customer.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{locale === "bn" ? "ঠিকানা:" : "Address:"}</span>
              <span className="text-foreground font-medium text-right max-w-[65%]">
                {placedOrder.customer.address},{" "}
                {placedOrder.customer.thana},{" "}
                {placedOrder.customer.district}
              </span>
            </div>
            <div className="flex justify-between">
              <span>{locale === "bn" ? "পদ্ধতি:" : "Payment:"}</span>
              <span className="text-foreground font-medium">
                {placedOrder.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between text-base font-serif text-foreground pt-3 border-t border-border">
              <span>{locale === "bn" ? "সর্বমোট:" : "Total:"}</span>
              <span>{formatPrice(placedOrder.grandTotal)}</span>
            </div>
          </div>

          <Button
            asChild
            className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold mt-4"
          >
            <Link href="/shop">
              {locale === "bn" ? "আরও কেনাকাটা করুন" : "Return to Shop"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // EMPTY CART
  // ─────────────────────────────────────────────────────────────
  if (checkoutItems.length === 0) {
    return (
      <div className="container-narrow py-28 text-center">
        <p className="font-serif text-3xl text-foreground mb-4">
          {locale === "bn" ? "আপনার শপিং ব্যাগ খালি" : "Your Bag is Empty"}
        </p>
        <Button
          asChild
          className="rounded-none btn-premium px-8 py-5 text-xs tracking-[0.15em] uppercase"
        >
          <Link href="/shop">
            {locale === "bn" ? "দোকানে ফিরে যান" : "Browse Pieces"}
          </Link>
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // MAIN CHECKOUT UI
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full checkout-page">
      {/* Breadcrumb */}
      <div className="container-full py-5 border-b border-border">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground uppercase tracking-[0.1em]">
          {isDirectBuy ? (
            <Link href="/shop" className="hover:text-foreground transition-colors">
              {locale === "bn" ? "দোকান" : "Shop"}
            </Link>
          ) : (
            <Link href="/cart" className="hover:text-foreground transition-colors">
              {locale === "bn" ? "শপিং ব্যাগ" : "Bag"}
            </Link>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">
            {locale === "bn" ? "চেকআউট" : "Checkout"}
          </span>
          {isDirectBuy && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-primary font-semibold">
                {locale === "bn" ? "সরাসরি অর্ডার" : "Direct Order"}
              </span>
            </>
          )}
        </div>
      </div>

      <section className="py-10 md:py-14">
        <div className="container-full">
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} locale={locale} />

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-start mt-10">
            {/* ── LEFT: Step Content ── */}
            <div className="lg:col-span-7">
              <AnimatePresence mode="wait">

                {/* ══════════════════════════════════════
                    STEP 1: CUSTOMER INFO
                ══════════════════════════════════════ */}
                {currentStep === "info" && (
                  <motion.div
                    key="step-info"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="checkout-step-header">
                      <div className="checkout-step-icon-wrap">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                          {locale === "bn" ? "আপনার তথ্য" : "Your Information"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {locale === "bn"
                            ? "আপনার যোগাযোগের তথ্য নিশ্চিত করুন"
                            : "Confirm your contact information"}
                        </p>
                      </div>
                    </div>

                    <div className="checkout-card space-y-5">
                      <div className="checkout-field">
                        <label className="checkout-label">
                          <User className="w-3.5 h-3.5" />
                          {locale === "bn" ? "পূর্ণ নাম" : "Full Name"}
                        </label>
                        <input
                          type="text"
                          value={customerInfo.fullName}
                          onChange={(e) =>
                            setCustomerInfo((p) => ({
                              ...p,
                              fullName: e.target.value,
                            }))
                          }
                          required
                          className="checkout-input"
                          placeholder="আপনার পূর্ণ নাম"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="checkout-field">
                          <label className="checkout-label">
                            <Phone className="w-3.5 h-3.5" />
                            {locale === "bn" ? "মোবাইল নম্বর" : "Phone Number"}
                          </label>
                          <input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) =>
                              setCustomerInfo((p) => ({
                                ...p,
                                phone: e.target.value,
                              }))
                            }
                            required
                            className="checkout-input"
                            placeholder="01XXXXXXXXX"
                          />
                        </div>

                        <div className="checkout-field">
                          <label className="checkout-label">
                            <Mail className="w-3.5 h-3.5" />
                            {locale === "bn" ? "ইমেইল" : "Email Address"}
                          </label>
                          <input
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) =>
                              setCustomerInfo((p) => ({
                                ...p,
                                email: e.target.value,
                              }))
                            }
                            className="checkout-input"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={goNext}
                      className="w-full btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
                    >
                      {locale === "bn"
                        ? "ডেলিভারি তথ্য দিন"
                        : "Continue to Delivery"}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </motion.div>
                )}

                {/* ══════════════════════════════════════
                    STEP 2: DELIVERY INFO
                ══════════════════════════════════════ */}
                {currentStep === "delivery" && (
                  <motion.div
                    key="step-delivery"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="checkout-step-header">
                      <div className="checkout-step-icon-wrap">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                          {locale === "bn"
                            ? "ডেলিভারি ঠিকানা"
                            : "Delivery Location"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {locale === "bn"
                            ? "পার্সেলটি কোথায় পৌঁছে দিতে হবে?"
                            : "Where should we deliver your parcel?"}
                        </p>
                      </div>
                    </div>

                    {/* ── Delivery Mode Toggle ── */}
                    <div className="delivery-mode-toggle">
                      <button
                        type="button"
                        onClick={() => {
                          setDeliveryMode("self");
                          handleUseCurrentLocation();
                        }}
                        className={cn(
                          "delivery-mode-btn",
                          deliveryMode === "self" && "delivery-mode-btn-active"
                        )}
                      >
                        {gpsLoading ? (
                          <Loader2 className="w-4 h-4 shrink-0 text-primary animate-spin" />
                        ) : gpsSuccess && deliveryMode === "self" ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                        ) : (
                          <Navigation className="w-4 h-4 shrink-0" />
                        )}
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {locale === "bn"
                              ? "আমার কাছে ডেলিভারি"
                              : "Deliver to Me"}
                          </p>
                          <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                            {gpsLoading
                              ? locale === "bn"
                                ? "📡 জিপিএস লোকেশন নেওয়া হচ্ছে..."
                                : "📡 Capturing GPS location..."
                              : gpsSuccess && deliveryMode === "self"
                              ? locale === "bn"
                                ? "✅ GPS লোকেশন পিন হয়েছে (নিচে ঠিকানা লিখুন)"
                                : "✅ GPS location pinned (fill address below)"
                              : locale === "bn"
                              ? "GPS লোকেশন পিন করুন (নিচে ঠিকানা লিখুন)"
                              : "Capture GPS location (fill address below)"}
                          </p>
                          {gpsError && deliveryMode === "self" && (
                            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                              <Info className="w-3 h-3 shrink-0" />
                              {gpsError}
                            </p>
                          )}
                        </div>
                        {deliveryMode === "self" && (
                          <div className="delivery-mode-check">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMode("other")}
                        className={cn(
                          "delivery-mode-btn",
                          deliveryMode === "other" && "delivery-mode-btn-active"
                        )}
                      >
                        <Map className="w-4 h-4 shrink-0" />
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {locale === "bn"
                              ? "অন্য ঠিকানায় ডেলিভারি"
                              : "Deliver to Another Location"}
                          </p>
                          <p className="text-[11px] opacity-75 mt-0.5 leading-snug">
                            {locale === "bn"
                              ? "ম্যাপে পিন করে সঠিক লোকেশন দিন"
                              : "Pin the exact location on the map"}
                          </p>
                        </div>
                        {deliveryMode === "other" && (
                          <div className="delivery-mode-check">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {/* ── Leaflet Map (other mode) ── */}
                      {deliveryMode === "other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="checkout-card p-0 overflow-hidden">
                            <div className="p-4 border-b border-border flex items-center gap-2">
                              <Map className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-foreground">
                                {locale === "bn"
                                  ? "ম্যাপে ডেলিভারি লোকেশন নির্ধারণ করুন"
                                  : "Pin Delivery Location on Map"}
                              </span>
                              {pinnedLocation && (
                                <span className="ml-auto text-[10px] px-2 py-0.5 bg-primary/10 text-primary font-semibold rounded-full">
                                  {locale === "bn" ? "পিন সেট ✓" : "Pinned ✓"}
                                </span>
                              )}
                            </div>
                            <MapPicker
                              center={mapCenter}
                              onLocationSelect={handleLocationSelect}
                              locale={locale}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ── Address Form ── */}
                    <div className="checkout-card space-y-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {locale === "bn"
                            ? "ডেলিভারি ঠিকানার বিস্তারিত"
                            : "Delivery Address Details"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="checkout-field">
                          <label className="checkout-label">
                            {locale === "bn" ? "জেলা" : "District"}
                          </label>
                          <select
                            value={deliveryAddress.district}
                            onChange={(e) =>
                              setDeliveryAddress((p) => ({
                                ...p,
                                district: e.target.value,
                              }))
                            }
                            className="checkout-input cursor-pointer"
                          >
                            {BANGLADESH_DISTRICTS.map((d) => (
                              <option key={d.id} value={d.id}>
                                {locale === "bn" ? d.bn : d.en}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="checkout-field">
                          <label className="checkout-label">
                            {locale === "bn"
                              ? "থানা / উপজেলা"
                              : "Thana / Upazila"}
                          </label>
                          <input
                            type="text"
                            value={deliveryAddress.thana}
                            onChange={(e) =>
                              setDeliveryAddress((p) => ({
                                ...p,
                                thana: e.target.value,
                              }))
                            }
                            required
                            className="checkout-input"
                            placeholder={
                              locale === "bn" ? "যেমন: ধানমন্ডি" : "e.g. Dhanmondi"
                            }
                          />
                        </div>
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label">
                          {locale === "bn"
                            ? "গ্রাম / পাড়া / এলাকা"
                            : "Village / Neighbourhood"}
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.village}
                          onChange={(e) =>
                            setDeliveryAddress((p) => ({
                              ...p,
                              village: e.target.value,
                            }))
                          }
                          className="checkout-input"
                          placeholder={
                            locale === "bn"
                              ? "যেমন: পশ্চিম পাড়া"
                              : "e.g. West Para"
                          }
                        />
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label">
                          {locale === "bn"
                            ? "রোড, বাসা নং ও বিস্তারিত"
                            : "Road, House No & Street Address"}
                        </label>
                        <textarea
                          rows={2}
                          value={deliveryAddress.address}
                          onChange={(e) =>
                            setDeliveryAddress((p) => ({
                              ...p,
                              address: e.target.value,
                            }))
                          }
                          required
                          className="checkout-input resize-none"
                          placeholder={
                            locale === "bn"
                              ? "বাসা নং, রোড নং, ল্যান্ডমার্ক"
                              : "House no, Road no, Landmark"
                          }
                        />
                      </div>

                      <div className="checkout-field">
                        <label className="checkout-label">
                          {locale === "bn"
                            ? "বিশেষ নির্দেশনা (ঐচ্ছিক)"
                            : "Special Note (Optional)"}
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress.specialNote}
                          onChange={(e) =>
                            setDeliveryAddress((p) => ({
                              ...p,
                              specialNote: e.target.value,
                            }))
                          }
                          className="checkout-input"
                          placeholder={
                            locale === "bn"
                              ? "যেমন: বরফ দিয়ে প্যাক করুন"
                              : "e.g. Pack with extra ice"
                          }
                        />
                      </div>
                    </div>

                    {/* ── Pre-order Scheduling ── */}
                    <div className="checkout-card">
                      <div
                        onClick={() => {
                          const next = !isPreOrder;
                          setIsPreOrder(next);
                          if (!next)
                            setDeliveryAddress((p) => ({
                              ...p,
                              preferredDate: "",
                              preferredTime: "",
                              deliveryNote: "",
                            }));
                        }}
                        className={cn(
                          "flex items-start gap-3 cursor-pointer select-none",
                          isPreOrder && "mb-4"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isPreOrder}
                          readOnly
                          className="w-4 h-4 accent-primary mt-0.5 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold text-foreground">
                              {locale === "bn"
                                ? "প্রি-অর্ডার (নির্দিষ্ট সময়ে ডেলিভারি)"
                                : "Schedule Pre-Order Delivery"}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {locale === "bn"
                              ? "ক্যালেন্ডার থেকে তারিখ ও সময় নির্বাচন করুন"
                              : "Pick a calendar date and time for delivery"}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isPreOrder && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 pt-4 border-t border-border"
                          >
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div className="checkout-field">
                                <label className="checkout-label">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {locale === "bn"
                                    ? "ডেলিভারির তারিখ"
                                    : "Delivery Date"}
                                </label>
                                <input
                                  type="date"
                                  min={todayStr}
                                  value={deliveryAddress.preferredDate}
                                  onChange={(e) =>
                                    setDeliveryAddress((p) => ({
                                      ...p,
                                      preferredDate: e.target.value,
                                    }))
                                  }
                                  required={isPreOrder}
                                  className="checkout-input"
                                />
                              </div>
                              <div className="checkout-field">
                                <label className="checkout-label">
                                  <Clock className="w-3.5 h-3.5" />
                                  {locale === "bn"
                                    ? "ডেলিভারির সময়"
                                    : "Delivery Time"}
                                </label>
                                <input
                                  type="time"
                                  value={deliveryAddress.preferredTime}
                                  onChange={(e) =>
                                    setDeliveryAddress((p) => ({
                                      ...p,
                                      preferredTime: e.target.value,
                                    }))
                                  }
                                  required={isPreOrder}
                                  className="checkout-input"
                                />
                              </div>
                            </div>

                            <div className="p-3 bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 rounded-sm">
                              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                              <p>
                                {locale === "bn"
                                  ? "প্রি-অর্ডারে ক্যাশ অন ডেলিভারি বন্ধ থাকে। বিকাশ বা নগদ ব্যবহার করুন।"
                                  : "COD is disabled for pre-orders. Please use bKash or Nagad."}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="rounded-none py-6 px-6 text-xs tracking-[0.1em] uppercase"
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        {locale === "bn" ? "পেছনে" : "Back"}
                      </Button>
                      <Button
                        type="button"
                        onClick={goNext}
                        className="flex-1 btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
                      >
                        {locale === "bn" ? "নিশ্চিত করুন" : "Review Order"}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* ══════════════════════════════════════
                    STEP 3: CONFIRM & PAY
                ══════════════════════════════════════ */}
                {currentStep === "confirm" && (
                  <motion.div
                    key="step-confirm"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <div className="checkout-step-header">
                      <div className="checkout-step-icon-wrap">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="font-serif text-2xl md:text-3xl text-foreground">
                          {locale === "bn"
                            ? "অর্ডার নিশ্চিত করুন"
                            : "Confirm Your Order"}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {locale === "bn"
                            ? "তথ্য যাচাই করে পেমেন্ট পদ্ধতি নির্বাচন করুন"
                            : "Review details and choose payment method"}
                        </p>
                      </div>
                    </div>

                    {/* ── Review: Customer Info ── */}
                    <div className="checkout-review-card">
                      <div className="checkout-review-header">
                        <User className="w-4 h-4 text-primary" />
                        <span>
                          {locale === "bn" ? "আপনার তথ্য" : "Your Info"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep("info")}
                          className="checkout-edit-btn"
                        >
                          {locale === "bn" ? "পরিবর্তন করুন" : "Edit"}
                        </button>
                      </div>
                      <div className="checkout-review-body">
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "নাম" : "Name"}
                          </span>
                          <span className="checkout-review-value">
                            {customerInfo.fullName}
                          </span>
                        </div>
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "ফোন" : "Phone"}
                          </span>
                          <span className="checkout-review-value">
                            {customerInfo.phone}
                          </span>
                        </div>
                        {customerInfo.email && (
                          <div className="checkout-review-row">
                            <span className="checkout-review-label">
                              {locale === "bn" ? "ইমেইল" : "Email"}
                            </span>
                            <span className="checkout-review-value">
                              {customerInfo.email}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Review: Delivery Info ── */}
                    <div className="checkout-review-card">
                      <div className="checkout-review-header">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>
                          {locale === "bn" ? "ডেলিভারি তথ্য" : "Delivery Info"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep("delivery")}
                          className="checkout-edit-btn"
                        >
                          {locale === "bn" ? "পরিবর্তন করুন" : "Edit"}
                        </button>
                      </div>
                      <div className="checkout-review-body">
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "ধরন" : "Type"}
                          </span>
                          <span className="checkout-review-value flex items-center gap-1.5">
                            {deliveryMode === "self" ? (
                              <>
                                <Navigation className="w-3.5 h-3.5 text-primary" />
                                {locale === "bn"
                                  ? "আমার কাছে"
                                  : "Deliver to Me"}
                              </>
                            ) : (
                              <>
                                <Map className="w-3.5 h-3.5 text-primary" />
                                {locale === "bn"
                                  ? "অন্য ঠিকানায়"
                                  : "Different Location"}
                              </>
                            )}
                          </span>
                        </div>
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "জেলা" : "District"}
                          </span>
                          <span className="checkout-review-value">
                            {deliveryAddress.district}
                          </span>
                        </div>
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "থানা" : "Thana"}
                          </span>
                          <span className="checkout-review-value">
                            {deliveryAddress.thana}
                          </span>
                        </div>
                        <div className="checkout-review-row">
                          <span className="checkout-review-label">
                            {locale === "bn" ? "ঠিকানা" : "Address"}
                          </span>
                          <span className="checkout-review-value text-right max-w-[60%]">
                            {deliveryAddress.address}
                            {deliveryAddress.village
                              ? `, ${deliveryAddress.village}`
                              : ""}
                          </span>
                        </div>
                        {pinnedLocation && deliveryMode === "other" && (
                          <div className="checkout-review-row">
                            <span className="checkout-review-label">
                              {locale === "bn" ? "GPS পিন" : "Pinned GPS"}
                            </span>
                            <span className="checkout-review-value text-primary font-mono text-xs">
                              {pinnedLocation.lat.toFixed(4)},{" "}
                              {pinnedLocation.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                        {deliveryAddress.preferredDate && (
                          <div className="checkout-review-row">
                            <span className="checkout-review-label">
                              {locale === "bn"
                                ? "প্রি-অর্ডার"
                                : "Scheduled"}
                            </span>
                            <span className="checkout-review-value text-primary">
                              {deliveryAddress.preferredDate}{" "}
                              {deliveryAddress.preferredTime
                                ? `• ${deliveryAddress.preferredTime}`
                                : ""}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── Payment Method ── */}
                    <div className="checkout-card space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground">
                          {locale === "bn"
                            ? "পেমেন্ট পদ্ধতি"
                            : "Payment Method"}
                        </span>
                      </div>

                      {[
                        {
                          id: "BKASH",
                          name: "bKash Digital Payment",
                          nameBn: "বিকাশ পেমেন্ট",
                          desc: "Instant • 1.5% cashback",
                          descBn: "তাৎক্ষণিক • ১.৫% ক্যাশব্যাক",
                          emoji: "🟣",
                        },
                        {
                          id: "NAGAD",
                          name: "Nagad Gateway",
                          nameBn: "নগদ পেমেন্ট",
                          desc: "Fast direct checkout",
                          descBn: "দ্রুত সরাসরি চেকআউট",
                          emoji: "🟠",
                        },
                        {
                          id: "COD",
                          name: "Cash on Delivery",
                          nameBn: "ক্যাশ অন ডেলিভারি",
                          desc: "Pay when received",
                          descBn: "পণ্য পেলে পেমেন্ট",
                          emoji: "💵",
                        },
                      ].map((m) => {
                        const isCod = m.id === "COD";
                        const disabled = isPreOrder && isCod;
                        return (
                          <div
                            key={m.id}
                            onClick={() => {
                              if (!disabled) setPaymentMethod(m.id as any);
                            }}
                            className={cn(
                              "payment-option",
                              disabled && "payment-option-disabled",
                              !disabled &&
                                paymentMethod === m.id &&
                                "payment-option-selected"
                            )}
                          >
                            <span className="text-xl">{m.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "font-serif text-base font-medium",
                                  disabled
                                    ? "line-through text-muted-foreground"
                                    : "text-foreground"
                                )}
                              >
                                {locale === "bn" ? m.nameBn : m.name}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {disabled
                                  ? locale === "bn"
                                    ? "⚠️ প্রি-অর্ডারে বন্ধ"
                                    : "⚠️ Disabled for pre-orders"
                                  : locale === "bn"
                                  ? m.descBn
                                  : m.desc}
                              </p>
                            </div>
                            <div
                              className={cn(
                                "payment-radio",
                                disabled && "payment-radio-disabled",
                                !disabled &&
                                  paymentMethod === m.id &&
                                  "payment-radio-selected"
                              )}
                            >
                              {!disabled && paymentMethod === m.id && (
                                <Check className="w-3 h-3" />
                              )}
                              {disabled && <X className="w-3 h-3" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goBack}
                        className="rounded-none py-6 px-6 text-xs tracking-[0.1em] uppercase"
                      >
                        <ArrowLeft className="mr-2 w-4 h-4" />
                        {locale === "bn" ? "পেছনে" : "Back"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleFinalOrder}
                        disabled={isProcessing}
                        className="flex-1 btn-premium py-6 rounded-none text-xs tracking-[0.15em] uppercase font-semibold"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            {locale === "bn"
                              ? "প্রক্রিয়াকরণ হচ্ছে..."
                              : "Processing..."}
                          </>
                        ) : (
                          <>
                            {locale === "bn"
                              ? "অর্ডার সম্পন্ন করুন"
                              : "Place Order Now"}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="lg:col-span-5">
              <div className="order-summary-panel">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-serif text-2xl text-foreground">
                    {locale === "bn" ? "অর্ডার সংক্ষেপ" : "Order Summary"}
                  </h3>
                  {isDirectBuy && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary border border-primary/20">
                      {locale === "bn" ? "সরাসরি অর্ডার" : "Direct"}
                    </span>
                  )}
                </div>

                <div className="divide-y divide-border/70 max-h-80 overflow-y-auto pr-1 -mr-1">
                  {checkoutItems.map((it) => {
                    const isMerged = mergedCartItemIds.includes(it.id);
                    return (
                      <div key={it.id} className="py-3 flex gap-3 items-center">
                        <img
                          src={it.product.images[0]}
                          alt={it.product.nameEn}
                          className="w-12 h-14 object-cover bg-muted flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-serif text-sm text-foreground truncate">
                            {locale === "bn"
                              ? it.product.nameBn
                              : it.product.nameEn}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {it.quantity} × {it.selectedWeight} {it.selectedUnit}
                          </p>
                          {isMerged && (
                            <span className="text-[9px] font-sans px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              {locale === "bn" ? "ব্যাগ থেকে" : "From Bag"}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-serif text-sm text-foreground font-medium block">
                            {formatPrice(it.unitPrice * it.quantity)}
                          </span>
                          {isMerged && (
                            <button
                              type="button"
                              onClick={() =>
                                setMergedCartItemIds((prev) =>
                                  prev.filter((id) => id !== it.id)
                                )
                              }
                              className="text-[10px] text-destructive hover:underline cursor-pointer"
                            >
                              {locale === "bn" ? "বাদ দিন" : "Remove"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cart Reminder (Direct Buy Mode) */}
                {isDirectBuy &&
                  unmergedCartItems.length > 0 &&
                  !reminderDismissed && (
                    <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/25 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-semibold text-foreground">
                            {locale === "bn"
                              ? `ব্যাগে আরও ${unmergedCartItems.length}টি পণ্য`
                              : `${unmergedCartItems.length} more item(s) in bag`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReminderDismissed(true)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {unmergedCartItems.map((cartItem) => (
                          <div
                            key={cartItem.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <p className="text-xs text-foreground truncate flex-1">
                              {locale === "bn"
                                ? cartItem.product.nameBn
                                : cartItem.product.nameEn}
                            </p>
                            <button
                              type="button"
                              onClick={() =>
                                setMergedCartItemIds((prev) =>
                                  prev.includes(cartItem.id)
                                    ? prev
                                    : [...prev, cartItem.id]
                                )
                              }
                              className="px-2.5 py-1 text-[11px] font-semibold bg-background hover:bg-primary hover:text-primary-foreground text-primary border border-primary/30 hover:border-primary transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>
                                {locale === "bn" ? "যোগ করুন" : "Add"}
                              </span>
                            </button>
                          </div>
                        ))}
                      </div>
                      {unmergedCartItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setMergedCartItemIds(items.map((it) => it.id))
                          }
                          className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          {locale === "bn"
                            ? "সবগুলো যোগ করুন"
                            : "Add All"}
                        </button>
                      )}
                    </div>
                  )}

                {/* Price Breakdown */}
                <div className="space-y-2 text-xs border-t border-border pt-5 mt-5 text-muted-foreground">
                  <div className="flex justify-between">
                    <span>{locale === "bn" ? "সাবটোটাল" : "Subtotal"}</span>
                    <span className="text-foreground font-medium">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>
                        {locale === "bn" ? "ডিসকাউন্ট" : "Discount"}
                      </span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{locale === "bn" ? "ডেলিভারি" : "Delivery"}</span>
                    <span className="text-foreground font-medium">
                      {deliveryFee === 0
                        ? locale === "bn"
                          ? "ফ্রি"
                          : "Complimentary"
                        : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-serif text-foreground pt-4 border-t border-border font-medium">
                    <span>{locale === "bn" ? "সর্বমোট" : "Total"}</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* Secure badge */}
                <div className="flex items-center justify-center gap-2 mt-5 pt-5 border-t border-border text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  <span>
                    {locale === "bn"
                      ? "১০০% নিরাপদ চেকআউট"
                      : "100% Secure Checkout"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Page Export with Suspense
// ─────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container-narrow py-28 text-center text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-lg">লোড হচ্ছে...</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
