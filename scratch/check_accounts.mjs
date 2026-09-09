import { prisma } from "../packages/database/src/client.ts";

async function main() {
  const [admins, hubs] = await Promise.all([
    prisma.adminUser.findMany({ select: { id: true, email: true, name: true, role: true } }),
    prisma.hubUser.findMany({ select: { id: true, email: true, name: true, role: true, hubZone: true } }),
  ]);
  console.log("Current Admin Users:", admins);
  console.log("Current Hub Users:", hubs);
}

main().catch(console.error).finally(() => process.exit(0));
