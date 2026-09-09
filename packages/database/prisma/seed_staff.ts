import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🛡️ Seeding Initial Admin and Hub Staff Accounts into Supabase...");

  // Default initial password for all platform staff
  const staffPassword = "Admin@tatka2024!";
  const passwordHash = await bcrypt.hash(staffPassword, 12);

  // ---------------------------------------------------------------------------
  // 1. Admin Control Panel Staff (AdminUser)
  // ---------------------------------------------------------------------------
  const adminStaffList = [
    {
      email: "admin@tatkabazar.com",
      name: "প্রধান অ্যাডমিন (CEO & Founder)",
      role: "SUPER_ADMIN" as const,
    },
    {
      email: "finance@tatkabazar.com",
      name: "মুহাম্মদ রাশেদুল হাসান (Finance & Accounts Head)",
      role: "FINANCE" as const,
    },
    {
      email: "support.admin@tatkabazar.com",
      name: "নাজমুন নাহার (Customer Support Lead)",
      role: "SUPPORT" as const,
    },
    {
      email: "staff@tatkabazar.com",
      name: "তানভীর আহমেদ (Platform Ops Moderator)",
      role: "STAFF" as const,
    },
  ];

  for (const staff of adminStaffList) {
    const record = await prisma.adminUser.upsert({
      where: { email: staff.email },
      update: {
        name: staff.name,
        role: staff.role,
        passwordHash,
        isActive: true,
      },
      create: {
        email: staff.email,
        name: staff.name,
        role: staff.role,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`✅ [Admin Panel] ${record.role} created: ${record.email} (${record.name})`);
  }

  // ---------------------------------------------------------------------------
  // 2. Hub Operations Staff (HubUser - Desktop Only Panel)
  // ---------------------------------------------------------------------------
  const hubStaffList = [
    {
      email: "hub.manager@tatkabazar.com",
      name: "আরিফুর রহমান",
      nameBn: "আরিফুর রহমান",
      role: "SUPER_ADMIN" as const,
      hubZone: "Dhaka Central HQ",
      phone: "01711-001122",
      avatar: "🛡️",
    },
    {
      email: "ops@tatkabazar.com",
      name: "কামরুল হাসান",
      nameBn: "কামরুল হাসান",
      role: "OPS_MANAGER" as const,
      hubZone: "Mirpur Hub",
      phone: "01811-334455",
      avatar: "⚙️",
    },
    {
      email: "dispatcher@tatkabazar.com",
      name: "মাহমুদুল হক (Chief Dispatcher)",
      nameBn: "মাহমুদুল হক",
      role: "DISPATCHER" as const,
      hubZone: "Dhanmondi Hub",
      phone: "01911-556677",
      avatar: "📡",
    },
    {
      email: "cashier@tatkabazar.com",
      name: "জাহিদুল ইসলাম (Cash Collector)",
      nameBn: "জাহিদুল ইসলাম",
      role: "CASH_COLLECTOR" as const,
      hubZone: "Karwan Bazar Central",
      phone: "01511-778899",
      avatar: "💰",
    },
    {
      email: "support@tatkabazar.com",
      name: "ফারহানা সুলতানা (Rider Helpdesk)",
      nameBn: "ফারহানা সুলতানা",
      role: "SUPPORT_AGENT" as const,
      hubZone: "All Hubs",
      phone: "01611-990011",
      avatar: "🎧",
    },
    {
      email: "auditor@tatkabazar.com",
      name: "সৈয়দ ইকবাল (Compliance Auditor)",
      nameBn: "সৈয়দ ইকবাল",
      role: "VIEWER" as const,
      hubZone: "Dhaka Region",
      phone: "01311-223344",
      avatar: "🔍",
    },
  ];

  for (const hubStaff of hubStaffList) {
    const record = await (prisma as any).hubUser.upsert({
      where: { email: hubStaff.email },
      update: {
        name: hubStaff.name,
        nameBn: hubStaff.nameBn,
        role: hubStaff.role,
        hubZone: hubStaff.hubZone,
        phone: hubStaff.phone,
        avatar: hubStaff.avatar,
        passwordHash,
        isActive: true,
      },
      create: {
        email: hubStaff.email,
        name: hubStaff.name,
        nameBn: hubStaff.nameBn,
        role: hubStaff.role,
        hubZone: hubStaff.hubZone,
        phone: hubStaff.phone,
        avatar: hubStaff.avatar,
        passwordHash,
        isActive: true,
      },
    });
    console.log(`✅ [Hub Portal] ${record.role} created: ${record.email} (${record.name}) - Zone: ${record.hubZone}`);
  }

  console.log("\n=======================================================");
  console.log("🎉 All Admin and Hub Staff Accounts Created in Supabase!");
  console.log("🔑 Default Master Password for all accounts: Admin@tatka2024!");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("Error seeding staff accounts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
