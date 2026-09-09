// =============================================================================
// Tatka Bazar — Customer Orders Store & Utilities
// Manages customer order history, active order tracking, and reorder functionality
// =============================================================================

export interface OrderItem {
  name: string;
  qty: string;
  price: number;
  productId?: string;
  image?: string;
}

export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Review"
  | "Preorder";

export interface CustomerOrder {
  id: string;
  orderNumber?: string;
  date: string;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  deliveryFee?: number;
  discount?: number;
  items: string;
  rawItems: OrderItem[];
  deliveryAddress?: string;
  deliveryArea?: string;
  deliverySlot?: string;
  paymentMethod?: string;
  paymentStatus?: "PAID" | "UNPAID" | "COD";
  rider?: {
    name: string;
    phone: string;
    rating?: string;
    vehicle?: string;
  };
  deliveryOtp?: string;
  canTrack?: boolean;
}

export const INITIAL_ORDERS: CustomerOrder[] = [
  {
    id: "TB-8942",
    orderNumber: "TB-8942",
    date: "আজকে, দুপুর ২:১৫",
    status: "Processing",
    total: 1530,
    subtotal: 1410,
    deliveryFee: 120,
    discount: 0,
    items: "তাজা পদ্মা ইলিশ মাছ (১ কেজি) ও অর্গানিক পালং শাক",
    deliveryAddress: "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
    deliveryArea: "ধানমন্ডি",
    deliverySlot: "মার্নিং ফ্রেশ (০৭:০০ - ০৯:০০ AM)",
    paymentMethod: "bKash",
    paymentStatus: "PAID",
    rawItems: [
      { name: "তাজা পদ্মা ইলিশ", qty: "১ কেজি", price: 1350 },
      { name: "অর্গানিক পালং শাক", qty: "১ আঁটি", price: 60 },
      { name: "ডেলিভারি চার্জ", qty: "এক্সপ্রেস", price: 120 },
    ],
    rider: {
      name: "করিম মিয়া (Platinum Rider)",
      phone: "+880 1711-223344",
      rating: "4.9 ★",
      vehicle: "হোন্ডা সিবি শাইন (বাইক)",
    },
    deliveryOtp: "4826",
    canTrack: true,
  },
  {
    id: "TB-8921",
    orderNumber: "TB-8921",
    date: "গতকাল, বিকাল ৫:০০",
    status: "Shipped",
    total: 820,
    subtotal: 760,
    deliveryFee: 60,
    discount: 0,
    items: "ফার্ম ফ্রেশ ডিম (১ ডজন), অর্গানিক খাঁটি দুধ ও খাঁটি গাওয়া ঘি",
    deliveryAddress: "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
    deliveryArea: "ধানমন্ডি",
    deliverySlot: "ইভিনিং স্লট (০৫:০০ - ০৭:০০ PM)",
    paymentMethod: "ক্যাশ অন ডেলিভারি (COD)",
    paymentStatus: "COD",
    rawItems: [
      { name: "দেশি ফার্ম ডিম", qty: "১ ডজন", price: 160 },
      { name: "অর্গানিক খাঁটি তরল দুধ", qty: "২ লিটার", price: 220 },
      { name: "খাঁটি গাওয়া ঘি", qty: "২৫০ গ্রাম", price: 380 },
      { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 },
    ],
    rider: {
      name: "সোহেল রানা (Gold Rider)",
      phone: "+880 1722-556677",
      rating: "4.8 ★",
      vehicle: "ডিসকভার ১০০ (বাইক)",
    },
    deliveryOtp: "7319",
    canTrack: true,
  },
  {
    id: "TB-8890",
    orderNumber: "TB-8890",
    date: "২ দিন আগে",
    status: "Delivered",
    total: 2450,
    subtotal: 2390,
    deliveryFee: 60,
    discount: 0,
    items: "প্রিমিয়াম বাসমতি চাল ও ঘানি ভাঙা সরিষার তেল",
    deliveryAddress: "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
    deliveryArea: "ধানমন্ডি",
    deliverySlot: "স্ট্যান্ডার্ড ডেলিভারি",
    paymentMethod: "Nagad",
    paymentStatus: "PAID",
    rawItems: [
      { name: "প্রিমিয়াম বাসমতি চাল", qty: "৫ কেজি", price: 1850 },
      { name: "ঘানি ভাঙা সরিষার তেল", qty: "১ লিটার", price: 540 },
      { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 },
    ],
    rider: {
      name: "রাকিবুল হাসান",
      phone: "+880 1733-445566",
      rating: "4.7 ★",
      vehicle: "টিভিএস মেট্রো",
    },
    canTrack: false,
  },
  {
    id: "TB-8812",
    orderNumber: "TB-8812",
    date: "০২ সেপ্টেম্বর",
    status: "Delivered",
    total: 1200,
    subtotal: 1140,
    deliveryFee: 60,
    discount: 0,
    items: "সুন্দরবনের খাঁটি মধু ও লাল ড্রাগন ফল",
    deliveryAddress: "লেভেল ৮, টাওয়ার ৭১, গুলশান-২, ঢাকা",
    deliveryArea: "গুলশান",
    deliverySlot: "আফটারনুন স্লট",
    paymentMethod: "bKash",
    paymentStatus: "PAID",
    rawItems: [
      { name: "সুন্দরবনের প্রাকৃতিক মধু", qty: "৫০০ গ্রাম", price: 750 },
      { name: "লাল ড্রাগন ফল", qty: "১ কেজি", price: 390 },
      { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 },
    ],
    canTrack: false,
  },
  {
    id: "TB-8740",
    orderNumber: "TB-8740",
    date: "২৮ আগস্ট",
    status: "Preorder",
    total: 3500,
    subtotal: 3440,
    deliveryFee: 60,
    discount: 0,
    items: "চাঁদপুরের স্পেশাল নদীর রূপচাঁদা ও বড় বাগদা চিংড়ি",
    deliveryAddress: "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
    deliveryArea: "ধানমন্ডি",
    deliverySlot: "প্রি-অর্ডার স্পেশাল স্লট",
    paymentMethod: "অনলাইন কার্ড",
    paymentStatus: "PAID",
    rawItems: [
      { name: "নদীর ফ্রেশ রূপচাঁদা", qty: "১ কেজি", price: 1800 },
      { name: "বড় গলদা/বাগদা চিংড়ি", qty: "১ কেজি", price: 1640 },
      { name: "ডেলিভারি চার্জ", qty: "নরমাল", price: 60 },
    ],
    canTrack: false,
  },
];

const STORAGE_KEY = "tatka_customer_orders";

/**
 * Get all customer orders from localStorage with fallback to INITIAL_ORDERS
 */
export function getCustomerOrders(): CustomerOrder[] {
  if (typeof window === "undefined") return INITIAL_ORDERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to parse orders from localStorage:", err);
  }
  return INITIAL_ORDERS;
}

/**
 * Find the latest ongoing/active order (Processing, Shipped, Out for Delivery, or Pending)
 */
export function getActiveOrder(): CustomerOrder | null {
  const allOrders = getCustomerOrders();
  const activeStatuses = ["processing", "shipped", "out_for_delivery", "pending"];
  const active = allOrders.find((o) =>
    activeStatuses.includes(o.status.toLowerCase())
  );
  return active || null;
}

/**
 * Save a new order (e.g. from checkout)
 */
export function saveCustomerOrder(newOrder: Partial<CustomerOrder>): CustomerOrder {
  const all = getCustomerOrders();
  const orderNumber =
    newOrder.orderNumber || newOrder.id || `TB-${Math.floor(1000 + Math.random() * 9000)}`;

  const created: CustomerOrder = {
    id: orderNumber,
    orderNumber,
    date: new Date().toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: (newOrder.status as OrderStatus) || "Processing",
    total: newOrder.total || 0,
    subtotal: newOrder.subtotal || newOrder.total || 0,
    deliveryFee: newOrder.deliveryFee || 60,
    discount: newOrder.discount || 0,
    items: newOrder.items || "অর্ডারকৃত পণ্যসমূহ",
    rawItems: newOrder.rawItems || [],
    deliveryAddress: newOrder.deliveryAddress || "বাড়ি #৪২, রোড #৭/এ, ধানমন্ডি, ঢাকা",
    deliveryArea: newOrder.deliveryArea || "ঢাকা",
    deliverySlot: newOrder.deliverySlot || "মার্নিং ফ্রেশ (০৭:০০ - ০৯:০০ AM)",
    paymentMethod: newOrder.paymentMethod || "ক্যাশ অন ডেলিভারি",
    paymentStatus: newOrder.paymentStatus || "PAID",
    rider: newOrder.rider || {
      name: "করিম মিয়া (Platinum Rider)",
      phone: "+880 1711-223344",
      rating: "4.9 ★",
      vehicle: "হোন্ডা সিবি শাইন (বাইক)",
    },
    deliveryOtp: newOrder.deliveryOtp || String(Math.floor(1000 + Math.random() * 9000)),
    canTrack: true,
  };

  const updated = [created, ...all];
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("tatka_orders_updated", { detail: created }));

    try {
      localStorage.setItem("tatka_sync_broadcast", JSON.stringify({
        type: "NEW_ORDER",
        orderId: created.id,
        amount: created.total,
        deliveryZone: created.deliveryArea,
        timestamp: new Date().toISOString(),
      }));
      window.dispatchEvent(new CustomEvent("tatka_sync_event", { detail: created }));

      if (typeof window.BroadcastChannel !== "undefined") {
        const bc = new BroadcastChannel("tatka_vendor_realtime_sync_channel");
        bc.postMessage({
          type: "NEW_ORDER",
          orderId: created.id,
          amount: created.total,
          deliveryZone: created.deliveryArea,
          timestamp: new Date().toISOString(),
        });
        setTimeout(() => bc.close(), 1000);
      }
    } catch {}
  }
  return created;
}
