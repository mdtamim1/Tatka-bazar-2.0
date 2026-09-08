// ============================================================
// Hub Global In-Memory Store (globalThis-based)
// No database needed — upgradeable to real DB later
// ============================================================
import type {
  HubTeamMember, HubSession, HubActivityLog,
  HubRider, RiderDepositRequest, RiderWithdrawalRequest,
  HubVendor, VendorSettlementRequest,
  HubBroadcast, HubConfig,
} from "@/types/hub";

// ─── Extend globalThis ────────────────────────────────────────
const g = globalThis as unknown as {
  _hub_team?: HubTeamMember[];
  _hub_sessions?: Map<string, HubSession>;
  _hub_activity?: HubActivityLog[];
  _hub_riders?: HubRider[];
  _hub_deposits?: RiderDepositRequest[];
  _hub_withdrawals?: RiderWithdrawalRequest[];
  _hub_vendors?: HubVendor[];
  _hub_settlements?: VendorSettlementRequest[];
  _hub_broadcasts?: HubBroadcast[];
  _hub_config?: HubConfig;
};

// ─── Default Config ───────────────────────────────────────────
const DEFAULT_CONFIG: HubConfig = {
  defaultDeliveryFee: 60,
  defaultCommissionRate: 10,
  riderVercelUrl: "https://tatka-bazar-2-0-rider-seven.vercel.app",
  vendorVercelUrl: "https://tatka-bazar-2-0-vendor.vercel.app",
  riderLocalUrl: "http://localhost:3003",
  vendorLocalUrl: "http://localhost:3006",
  maintenanceMode: false,
};

// ─── Default Team ─────────────────────────────────────────────
const DEFAULT_TEAM: HubTeamMember[] = [
  {
    id: "hub-admin-001",
    name: "Super Admin",
    nameBn: "সুপার অ্যাডমিন",
    email: "admin@tatkabazar.com",
    password: "tatka@2026",
    role: "SUPER_ADMIN",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    avatar: "🛡️",
  },
  {
    id: "hub-ops-001",
    name: "Ops Manager",
    nameBn: "অপস ম্যানেজার",
    email: "ops@tatkabazar.com",
    password: "ops@2026",
    role: "OPS_MANAGER",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    avatar: "⚙️",
  },
  {
    id: "hub-support-001",
    name: "Support Agent",
    nameBn: "সাপোর্ট এজেন্ট",
    email: "support@tatkabazar.com",
    password: "support@2026",
    role: "SUPPORT_AGENT",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    avatar: "💬",
  },
];

// ─── Seed Riders ──────────────────────────────────────────────
const SEED_RIDERS: HubRider[] = [
  {
    id: "rider-demo-01",
    name: "Tamim Iqbal",
    nameBn: "তামীম ইকবাল",
    email: "singersujonkhan9@gmail.com",
    phone: "01700000001",
    vehicleType: "MOTORCYCLE",
    vehicleNumber: "ঢাকা মেট্রো-হ-৪৫-১২৩৪",
    zone: "মিরপুর-১০",
    status: "ACTIVE",
    tier: "BRONZE",
    kycStatus: "SUBMITTED",
    kycSubmittedAt: "2026-08-15T10:00:00Z",
    balance: 0,
    totalEarned: 4520,
    totalDeliveries: 47,
    dutyStatus: "ONLINE",
    paymentMethod: "BKASH",
    paymentAccount: "01700000001",
    rating: 4.7,
    totalRatings: 43,
    joinedAt: "2026-07-01T00:00:00Z",
  },
  {
    id: "rider-demo-02",
    name: "Sakib Al Hasan",
    nameBn: "সাকিব আল হাসান",
    email: "sakib.rider@gmail.com",
    phone: "01711000002",
    vehicleType: "MOTORCYCLE",
    vehicleNumber: "ঢাকা মেট্রো-গ-২২-৫৬৭৮",
    zone: "ধানমন্ডি",
    status: "ACTIVE",
    tier: "SILVER",
    kycStatus: "APPROVED",
    kycApprovedAt: "2026-07-20T00:00:00Z",
    balance: 350,
    totalEarned: 12400,
    totalDeliveries: 134,
    dutyStatus: "OFFLINE",
    paymentMethod: "NAGAD",
    paymentAccount: "01711000002",
    rating: 4.9,
    totalRatings: 128,
    joinedAt: "2026-05-15T00:00:00Z",
  },
  {
    id: "rider-demo-03",
    name: "Mushfiqur Rahim",
    nameBn: "মুশফিকুর রহিম",
    email: "mushfiq.rider@gmail.com",
    phone: "01722000003",
    vehicleType: "BICYCLE",
    vehicleNumber: "N/A",
    zone: "উত্তরা",
    status: "PENDING_KYC",
    tier: "BRONZE",
    kycStatus: "NOT_SUBMITTED",
    balance: 0,
    totalEarned: 0,
    totalDeliveries: 0,
    dutyStatus: "OFFLINE",
    joinedAt: "2026-09-01T00:00:00Z",
  },
  {
    id: "rider-demo-04",
    name: "Mahmudullah Riyad",
    nameBn: "মাহমুদুল্লাহ রিয়াদ",
    email: "riyad.rider@gmail.com",
    phone: "01733000004",
    vehicleType: "MOTORCYCLE",
    vehicleNumber: "ঢাকা মেট্রো-চ-৩৩-৯০১২",
    zone: "গুলশান",
    status: "SUSPENDED",
    tier: "BRONZE",
    kycStatus: "APPROVED",
    balance: -200,
    totalEarned: 1800,
    totalDeliveries: 18,
    dutyStatus: "OFFLINE",
    joinedAt: "2026-06-01T00:00:00Z",
    suspendedAt: "2026-09-05T00:00:00Z",
    suspendReason: "বারবার ডেলিভারি না করে পালিয়ে যাওয়া",
  },
];

// ─── Seed Vendors ─────────────────────────────────────────────
const SEED_VENDORS: HubVendor[] = [
  {
    id: "vnd-dhaka-089",
    storeName: "Green Farm Groceries & Organics",
    storeNameBn: "সবুজ খামার গ্রোসারি ও অর্গানিক",
    ownerName: "Rafiqul Islam",
    email: "support@greenfarm.tatkabazar.com",
    phone: "+8801711223344",
    address: "House 42, Road 9/A, Dhanmondi, Dhaka",
    deliveryZones: ["Dhanmondi", "Kalabagan", "Mohammadpur"],
    category: "Fresh Produce, Dairy & Groceries",
    commissionRate: 10,
    status: "ACTIVE",
    tier: "TRUSTED",
    rating: 4.88,
    totalOrders: 234,
    totalRevenue: 287400,
    settlementBalance: 12800,
    vacationMode: false,
    joinedAt: "2026-03-15T00:00:00Z",
    approvedAt: "2026-03-18T00:00:00Z",
    tradeLicense: "TRAD/DSCC/019283/2024",
    payoutMethod: "BKASH",
    payoutAccount: "+8801711223344",
  },
  {
    id: "vnd-dhaka-090",
    storeName: "Sadik Agro Fresh Foods",
    storeNameBn: "সাদিক এগ্রো ফ্রেশ ফুডস",
    ownerName: "Sadik Ahmed",
    email: "sadik.agro@gmail.com",
    phone: "01722334455",
    address: "Shop 12, Karwan Bazar, Dhaka",
    deliveryZones: ["Panthapath", "Farmgate", "Tejgaon"],
    category: "Fish, Meat & Vegetables",
    commissionRate: 12,
    status: "ACTIVE",
    tier: "STANDARD",
    rating: 4.6,
    totalOrders: 89,
    totalRevenue: 98600,
    settlementBalance: 5400,
    vacationMode: false,
    joinedAt: "2026-05-01T00:00:00Z",
    approvedAt: "2026-05-04T00:00:00Z",
    payoutMethod: "NAGAD",
    payoutAccount: "01722334455",
  },
  {
    id: "vnd-dhaka-091",
    storeName: "Al-Madina Fresh Store",
    storeNameBn: "আল-মদিনা ফ্রেশ স্টোর",
    ownerName: "Mohammad Abdullah",
    email: "almadina.fresh@gmail.com",
    phone: "01733445566",
    address: "Shop 5, Mirpur-10, Dhaka",
    deliveryZones: ["Mirpur", "Pallabi", "Kafrul"],
    category: "Groceries & Daily Essentials",
    commissionRate: 10,
    status: "PENDING_APPROVAL",
    tier: "STANDARD",
    rating: 0,
    totalOrders: 0,
    totalRevenue: 0,
    settlementBalance: 0,
    vacationMode: false,
    joinedAt: "2026-09-06T00:00:00Z",
    tradeLicense: "TRAD/DSCC/029184/2026",
    payoutMethod: "BKASH",
    payoutAccount: "01733445566",
  },
];

// ─── Seed Deposits ────────────────────────────────────────────
const SEED_DEPOSITS: RiderDepositRequest[] = [
  {
    id: "dep-001",
    riderId: "rider-demo-01",
    riderName: "তামীম ইকবাল",
    riderPhone: "01700000001",
    amount: 500,
    paymentMethod: "bKash",
    transactionId: "TXN8F2K9P",
    lastFour: "0001",
    status: "PENDING",
    requestedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "dep-002",
    riderId: "rider-demo-02",
    riderName: "সাকিব আল হাসান",
    riderPhone: "01711000002",
    amount: 1000,
    paymentMethod: "Nagad",
    transactionId: "TXN5L7M3Q",
    lastFour: "0002",
    status: "APPROVED",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    processedBy: "Super Admin",
  },
];

// ─── Seed Settlements ─────────────────────────────────────────
const SEED_SETTLEMENTS: VendorSettlementRequest[] = [
  {
    id: "stl-001",
    vendorId: "vnd-dhaka-089",
    vendorName: "সবুজ খামার গ্রোসারি",
    vendorPhone: "01711223344",
    amount: 12800,
    payoutMethod: "bKash Merchant",
    payoutAccount: "+8801711223344",
    ordersCount: 18,
    status: "PENDING",
    requestedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: "stl-002",
    vendorId: "vnd-dhaka-090",
    vendorName: "সাদিক এগ্রো ফ্রেশ ফুডস",
    vendorPhone: "01722334455",
    amount: 5400,
    payoutMethod: "Nagad",
    payoutAccount: "01722334455",
    ordersCount: 7,
    status: "APPROVED",
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    processedBy: "Super Admin",
  },
];

// ─── Init Store ────────────────────────────────────────────────
export function initHubStore() {
  if (!g._hub_team) g._hub_team = [...DEFAULT_TEAM];
  if (!g._hub_sessions) g._hub_sessions = new Map();
  if (!g._hub_activity) g._hub_activity = [];
  if (!g._hub_riders) g._hub_riders = [...SEED_RIDERS];
  if (!g._hub_deposits) g._hub_deposits = [...SEED_DEPOSITS];
  if (!g._hub_withdrawals) g._hub_withdrawals = [];
  if (!g._hub_vendors) g._hub_vendors = [...SEED_VENDORS];
  if (!g._hub_settlements) g._hub_settlements = [...SEED_SETTLEMENTS];
  if (!g._hub_broadcasts) g._hub_broadcasts = [];
  if (!g._hub_config) g._hub_config = { ...DEFAULT_CONFIG };
}

// ─── Accessors ─────────────────────────────────────────────────
export function getTeam() { initHubStore(); return g._hub_team!; }
export function getSessions() { initHubStore(); return g._hub_sessions!; }
export function getActivity() { initHubStore(); return g._hub_activity!; }
export function getRiders() { initHubStore(); return g._hub_riders!; }
export function getDeposits() { initHubStore(); return g._hub_deposits!; }
export function getWithdrawals() { initHubStore(); return g._hub_withdrawals!; }
export function getVendors() { initHubStore(); return g._hub_vendors!; }
export function getSettlements() { initHubStore(); return g._hub_settlements!; }
export function getBroadcasts() { initHubStore(); return g._hub_broadcasts!; }
export function getConfig() { initHubStore(); return g._hub_config!; }

// ─── Log Activity ───────────────────────────────────────────────
export function logActivity(entry: Omit<HubActivityLog, "id" | "timestamp">) {
  initHubStore();
  const log: HubActivityLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  g._hub_activity!.unshift(log);
  if (g._hub_activity!.length > 500) g._hub_activity!.pop();
}

// ─── Simple token generator ─────────────────────────────────────
export function generateToken(): string {
  return `hub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Validate session ───────────────────────────────────────────
export function validateSession(token: string): HubSession | null {
  initHubStore();
  const session = g._hub_sessions!.get(token);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    g._hub_sessions!.delete(token);
    return null;
  }
  return session;
}

// ─── Get dispatch endpoints ─────────────────────────────────────
export function getDispatchEndpoints() {
  const config = getConfig();
  return {
    rider: [config.riderVercelUrl, config.riderLocalUrl],
    vendor: [config.vendorVercelUrl, config.vendorLocalUrl],
    all: [
      config.riderVercelUrl,
      config.vendorVercelUrl,
      config.riderLocalUrl,
      config.vendorLocalUrl,
    ],
  };
}
