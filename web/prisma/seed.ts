// Seeds the admin user and a few demo hospitals/doctors (Section 12).
// Run with: npx tsx prisma/seed.ts

import bcrypt from "bcryptjs";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const HOSPITALS = [
  {
    name: "Sunrise Heart Institute",
    address: "12 MG Road",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    phone: "08012345678",
    latitude: 12.9756,
    longitude: 77.6068,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.6,
    beds: 320,
    doctors: [
      { name: "Dr. Asha Rao", specialization: "Cardiology", qualification: "MD, DM", experienceYears: 18, phone: "08012345679" },
      { name: "Dr. Vikram Sen", specialization: "Cardiothoracic Surgery", qualification: "MS, MCh", experienceYears: 22, phone: "08012345680" },
    ],
  },
  {
    name: "City Care Hospital",
    address: "45 Park Street",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560042",
    phone: "08022334455",
    latitude: 12.9719,
    longitude: 77.6412,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: false,
    rating: 4.1,
    beds: 180,
    doctors: [
      { name: "Dr. Meera Iyer", specialization: "Cardiology", qualification: "MBBS, MD", experienceYears: 12, phone: "08022334456" },
    ],
  },
  {
    name: "Northside Multispeciality",
    address: "9 Ring Road",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
    phone: "01144556677",
    latitude: 28.6448,
    longitude: 77.2167,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.4,
    beds: 410,
    doctors: [
      { name: "Dr. Rohan Gupta", specialization: "Cardiology", qualification: "MD, DM", experienceYears: 20, phone: "01144556678" },
    ],
  },
];

async function main() {
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@healthassistant.ai").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
  const name = process.env.SEED_ADMIN_NAME ?? "CardioCare Admin";

  const passwordHash = await bcrypt.hash(password, 11);
  await prisma.user.upsert({
    where: { email },
    create: { email, name, passwordHash, role: "ADMIN" },
    update: { role: "ADMIN" },
  });
  console.log(`Admin ready: ${email}`);

  for (const { doctors, ...hospital } of HOSPITALS) {
    const existing = await prisma.hospital.findFirst({
      where: { name: hospital.name, pincode: hospital.pincode },
    });
    const record =
      existing ??
      (await prisma.hospital.create({
        data: {
          ...hospital,
          location: { type: "Point", coordinates: [hospital.longitude, hospital.latitude] },
        },
      }));

    for (const doctor of doctors) {
      const found = await prisma.doctor.findFirst({
        where: { name: doctor.name, hospitalId: record.id },
      });
      if (!found) {
        await prisma.doctor.create({ data: { ...doctor, hospitalId: record.id } });
      }
    }
  }
  console.log(`Seeded ${HOSPITALS.length} hospitals with cardiologists.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
