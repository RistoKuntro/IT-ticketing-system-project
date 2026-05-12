import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@helpdesk.com',
      passwordHash: adminPassword,
      roleId: adminRole.id,
    },
  });

  const userPassword = await bcrypt.hash('User123!', 10);
  await prisma.user.upsert({
    where: { email: 'user@helpdesk.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@helpdesk.com',
      passwordHash: userPassword,
      roleId: userRole.id,
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });