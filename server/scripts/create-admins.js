import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: 'jash@gmail.com', password: 'jash1234', name: 'Jash (Admin)' },
    { email: 'kavishasharma@gmail.com', password: 'kavisha1234', name: 'Kavisha Sharma (Admin)' },
    { email: 'hemakshadmin@gmail.com', password: 'hemaksh1234', name: 'Hemaksh (Admin)' }
  ];

  console.log('Seeding / Upserting Admin Accounts...');

  for (const admin of admins) {
    const passwordHash = await bcrypt.hash(admin.password, 10);
    const user = await prisma.user.upsert({
      where: { email: admin.email.toLowerCase().trim() },
      update: {
        name: admin.name,
        password: passwordHash,
        isAdmin: true
      },
      create: {
        email: admin.email.toLowerCase().trim(),
        name: admin.name,
        password: passwordHash,
        isAdmin: true,
        languagePref: 'en'
      }
    });

    console.log(`✓ Admin User created/ready: ${user.email} (ID: ${user.id}, isAdmin: ${user.isAdmin})`);
  }

  await prisma.$disconnect();
}

main()
  .then(() => console.log('Admin accounts seeded successfully!'))
  .catch((e) => {
    console.error('Error seeding admins:', e);
    process.exit(1);
  });
