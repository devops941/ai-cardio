// Creates the 2dsphere index used by $geoNear (Section 9.5).
// Run with: npx tsx scripts/create-geo-index.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$runCommandRaw({
    createIndexes: "Hospital",
    indexes: [{ key: { location: "2dsphere" }, name: "hospital_location_2dsphere" }],
  });
  console.log("2dsphere index ready on Hospital.location");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
