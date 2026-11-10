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
  {
    name: "Meenakshi Mission Hospital and Research Centre",
    address: "Lake Area, Melur Road",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625107",
    phone: "04522588741",
    latitude: 9.9495,
    longitude: 78.1633,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.8,
    beds: 800,
    doctors: [
      { name: "Dr. N. Ganesan", specialization: "Cardiology", qualification: "MD, DM (Cardiology)", experienceYears: 24, phone: "04522588742" },
      { name: "Dr. R. Sivakumar", specialization: "Interventional Cardiology", qualification: "MD, DNB (Card)", experienceYears: 16, phone: "04522588743" },
    ],
  },
  {
    name: "Apollo Speciality Hospitals Madurai",
    address: "Lake View Road, KK Nagar",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625020",
    phone: "04522580880",
    latitude: 9.9238,
    longitude: 78.1487,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.7,
    beds: 300,
    doctors: [
      { name: "Dr. C. Jayachandran", specialization: "Cardiology", qualification: "MD, DM", experienceYears: 19, phone: "04522580881" },
    ],
  },
  {
    name: "Government Rajaji Hospital (Cardiac Care Wing)",
    address: "Panagal Road, Alwarpuram",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625020",
    phone: "04522532535",
    latitude: 9.9283,
    longitude: 78.1256,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.3,
    beds: 1200,
    doctors: [
      { name: "Dr. S. Balasubramanian", specialization: "Cardiology", qualification: "MD, DM", experienceYears: 22, phone: "04522532536" },
    ],
  },
  {
    name: "Vadamalayan Hospitals",
    address: "9A, Vallabhabhai Road, Chokkikulam",
    city: "Madurai",
    state: "Tamil Nadu",
    pincode: "625002",
    phone: "04522545400",
    latitude: 9.9366,
    longitude: 78.1384,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.5,
    beds: 250,
    doctors: [
      { name: "Dr. P. Rajesh", specialization: "Cardiology", qualification: "MD, DM", experienceYears: 14, phone: "04522545401" },
    ],
  },
  {
    name: "Apollo Hospitals Greams Road",
    address: "21 Greams Lane, Thousand Lights",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600006",
    phone: "04428290200",
    latitude: 13.0604,
    longitude: 80.2496,
    emergency24x7: true,
    hasCardiology: true,
    hasCathLab: true,
    rating: 4.8,
    beds: 600,
    doctors: [
      { name: "Dr. Y. Vijayachandra Reddy", specialization: "Interventional Cardiology", qualification: "MD, DM, FACC", experienceYears: 25, phone: "04428290201" },
    ],
  },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? "admin@healthassistant.ai").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? "Admin@12345";
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
