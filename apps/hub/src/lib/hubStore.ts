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
  adminVercelUrl: "https://tatka-bazar-2-0-admin.vercel.app",
  storefrontVercelUrl: "https://tatka-bazar-2-0-storefront.vercel.app",
  riderLocalUrl: "http://localhost:3003",
  vendorLocalUrl: "http://localhost:3006",
  maintenanceMode: false,
};

// ─── Default Team ─────────────────────────────────────────────
const DEFAULT_TEAM: HubTeamMember[] = [
  {
    id: "hub-admin-001",
    name: "Super Admin",
    nameBn: "Super Admin",
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
    nameBn: "Ops Manager",
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
    nameBn: "Support Agent",
    email: "support@tatkabazar.com",
    password: "support@2026",
    role: "SUPPORT_AGENT",
    isActive: true,
    createdAt: "2026-01-01T00:00:00Z",
    avatar: "💬",
  },
];

// ─── Clean Collections (No Demo Data) ─────────────────────────
const SEED_RIDERS: HubRider[] = [];
const SEED_VENDORS: HubVendor[] = [];
const SEED_DEPOSITS: RiderDepositRequest[] = [];
const SEED_SETTLEMENTS: VendorSettlementRequest[] = [];

// ─── Init Store ────────────────────────────────────────────────
export function initHubStore() {
  if (!g._hub_team) g._hub_team = [...DEFAULT_TEAM];
  if (!g._hub_sessions) g._hub_sessions = new Map();
  if (!g._hub_activity) g._hub_activity = [];
  if (!g._hub_riders) g._hub_riders = [];
  if (!g._hub_deposits) g._hub_deposits = [];
  if (!g._hub_withdrawals) g._hub_withdrawals = [];
  if (!g._hub_vendors) g._hub_vendors = [];
  if (!g._hub_settlements) g._hub_settlements = [];
  if (!g._hub_broadcasts) g._hub_broadcasts = [];
  if (!g._hub_config) g._hub_config = { ...DEFAULT_CONFIG };
}

export function resetHubStore() {
  g._hub_team = [...DEFAULT_TEAM];
  g._hub_sessions = new Map();
  g._hub_activity = [];
  g._hub_riders = [];
  g._hub_deposits = [];
  g._hub_withdrawals = [];
  g._hub_vendors = [];
  g._hub_settlements = [];
  g._hub_broadcasts = [];
  g._hub_config = { ...DEFAULT_CONFIG };
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
