import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: { name: 'admin' },
  });

  const specialistRole = await prisma.role.upsert({
    where: { name: 'specialist' },
    update: {},
    create: { name: 'specialist' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: { name: 'user' },
  });

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@helpdesk.com' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@helpdesk.com',
      phone: '+37255500001',
      passwordHash: adminPassword,
      roleId: adminRole.id,
    },
  });

  const userPassword = await bcrypt.hash('User123!', 10);
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@helpdesk.com' },
    update: {},
    create: {
      name: 'Regular User',
      email: 'user@helpdesk.com',
      phone: '+37255500002',
      passwordHash: userPassword,
      roleId: userRole.id,
    },
  });

  // create specialist users
  const specPassword = await bcrypt.hash('Specialist123!', 10);
  const specialist1 = await prisma.user.upsert({
    where: { email: 'pro1@helpdesk.com' },
    update: {},
    create: {
      name: 'IT Pro One',
      email: 'pro1@helpdesk.com',
      phone: '+37255500003',
      passwordHash: specPassword,
      roleId: specialistRole.id,
    },
  });

  const specialist2 = await prisma.user.upsert({
    where: { email: 'pro2@helpdesk.com' },
    update: {},
    create: {
      name: 'IT Pro Two',
      email: 'pro2@helpdesk.com',
      phone: '+37255500004',
      passwordHash: specPassword,
      roleId: specialistRole.id,
    },
  });

  // create tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      title: 'Printer ei tööta',
      description: 'Tindiga on mingi jama, printer viskab errori',
      priority: 'high',
      creatorId: regularUser.id,
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      title: 'Ei saa sisse',
      description: 'Parool ununes ja ei saa sisselogida',
      priority: 'medium',
      creatorId: regularUser.id,
    },
  });

  // assign specialists (many-to-many)
  await prisma.ticketAssignment.createMany({
    data: [
      { ticketId: ticket1.id, specialistId: specialist1.id },
      { ticketId: ticket1.id, specialistId: specialist2.id },
      { ticketId: ticket2.id, specialistId: specialist1.id },
    ],
    skipDuplicates: true,
  });

  // ticket responses
  await prisma.ticketResponse.create({
    data: {
      content: 'Olen teel, vaatan üle.',
      ticketId: ticket1.id,
      authorId: specialist1.id,
    },
  });

  // close ticket2 and add feedback
  await prisma.ticket.update({ where: { id: ticket2.id }, data: { status: 'closed', isArchived: true, closedAt: new Date() } });

  await prisma.feedback.create({
    data: {
      ticketId: ticket2.id,
      userId: regularUser.id,
      rating: 5,
      comment: 'Väga kiire ja asjalik reageering!',
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