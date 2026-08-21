import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Tatka Bazar database...");

  // -------------------------------------------------------------------------
  // 1. Super Admin
  // -------------------------------------------------------------------------
  const adminHash = await bcrypt.hash("Admin@tatka2024!", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@tatkabazar.com" },
    update: {},
    create: {
      email: "admin@tatkabazar.com",
      name: "Super Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Admin created:", admin.email);

  // -------------------------------------------------------------------------
  // 2. Categories
  // -------------------------------------------------------------------------
  const grocery = await prisma.category.upsert({
    where: { slug: "grocery" },
    update: {},
    create: {
      name: "Grocery & Essentials",
      slug: "grocery",
      description: "Fresh groceries, daily essentials and pantry staples",
    },
  });

  const freshVeg = await prisma.category.upsert({
    where: { slug: "fresh-vegetables" },
    update: {},
    create: {
      name: "Fresh Vegetables",
      slug: "fresh-vegetables",
      parentId: grocery.id,
    },
  });

  const fruits = await prisma.category.upsert({
    where: { slug: "fresh-fruits" },
    update: {},
    create: {
      name: "Fresh Fruits",
      slug: "fresh-fruits",
      parentId: grocery.id,
    },
  });

  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: {
      name: "Electronics",
      slug: "electronics",
    },
  });

  console.log("✅ Categories created:", grocery.slug, freshVeg.slug, fruits.slug, electronics.slug);

  // -------------------------------------------------------------------------
  // 3. Sample Vendor
  // -------------------------------------------------------------------------
  const vendorHash = await bcrypt.hash("Vendor@tatka2024!", 12);
  const vendor = await prisma.vendor.upsert({
    where: { email: "greengrocer@tatkabazar.com" },
    update: {},
    create: {
      email: "greengrocer@tatkabazar.com",
      phone: "01700000001",
      businessName: "Green Grocer BD",
      slug: "green-grocer-bd",
      passwordHash: vendorHash,
      status: "APPROVED",
      commissionRate: 10,
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });
  console.log("✅ Vendor created:", vendor.businessName);

  // -------------------------------------------------------------------------
  // 4. Sample Customer
  // -------------------------------------------------------------------------
  const customerHash = await bcrypt.hash("Customer@tatka2024!", 12);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      phone: "01700000002",
      name: "Rafiq Ahmed",
      passwordHash: customerHash,
      isVerified: true,
    },
  });
  console.log("✅ Customer created:", customer.email);

  // -------------------------------------------------------------------------
  // 5. Sample Rider
  // -------------------------------------------------------------------------
  const riderHash = await bcrypt.hash("Rider@tatka2024!", 12);
  const rider = await prisma.deliveryRider.upsert({
    where: { email: "rider@tatkabazar.com" },
    update: {},
    create: {
      email: "rider@tatkabazar.com",
      phone: "01700000003",
      name: "Karim Molla",
      passwordHash: riderHash,
      vehicleType: "MOTORCYCLE",
      status: "OFFLINE",
      approvedById: admin.id,
      approvedAt: new Date(),
    },
  });
  console.log("✅ Rider created:", rider.email);

  // -------------------------------------------------------------------------
  // 6. Sample Products (Tatka Bazar's own stock)
  // -------------------------------------------------------------------------
  await prisma.product.upsert({
    where: { slug: "fresh-hilsa-fish" },
    update: {},
    create: {
      name: "Fresh Hilsa Fish (Ilish)",
      slug: "fresh-hilsa-fish",
      description: "Premium fresh Hilsa fish from the Padma river. Minimum 800g per piece.",
      price: 1200,
      comparePrice: 1400,
      sku: "TB-ILISH-001",
      stock: 50,
      isPublished: true,
      isFeatured: true,
      categoryId: grocery.id,
      vendorId: null, // Tatka Bazar's own
    },
  });

  await prisma.product.upsert({
    where: { slug: "organic-tomatoes-1kg" },
    update: {},
    create: {
      name: "Organic Tomatoes (1kg)",
      slug: "organic-tomatoes-1kg",
      description: "Farm-fresh organic tomatoes, pesticide-free.",
      price: 120,
      sku: "GG-TOM-001",
      stock: 200,
      isPublished: true,
      categoryId: freshVeg.id,
      vendorId: vendor.id,
    },
  });

  console.log("✅ Sample products created");

  // -------------------------------------------------------------------------
  // 7. Sample Coupon
  // -------------------------------------------------------------------------
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderValue: 500,
      maxUses: 1000,
      isActive: true,
    },
  });
  console.log("✅ Coupon created: WELCOME10");

  console.log("\n🎉 Seed complete! Test credentials:");
  console.log("   Admin:    admin@tatkabazar.com  / Admin@tatka2024!");
  console.log("   Vendor:   greengrocer@tatkabazar.com / Vendor@tatka2024!");
  console.log("   Customer: customer@example.com / Customer@tatka2024!");
  console.log("   Rider:    rider@tatkabazar.com / Rider@tatka2024!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
