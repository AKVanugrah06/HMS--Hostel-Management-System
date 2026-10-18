const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Hostel Management System Database Seeding...');

  // 1. Clear existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.roomApplication.deleteMany();
  await prisma.room.deleteMany();
  await prisma.warden.deleteMany();
  await prisma.student.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash passwords
  const wardenPasswordHash = await bcrypt.hash('WardenPass123!', 10);
  const studentPasswordHash = await bcrypt.hash('StudentPass123!', 10);

  // 3. Create Warden
  const wardenUser = await prisma.user.create({
    data: {
      email: 'warden@hostel.edu',
      passwordHash: wardenPasswordHash,
      role: 'warden',
      isVerified: true,
      warden: {
        create: {
          fullName: 'Dr. Alok Verma',
          assignedBlock: 'All Blocks (A, B, C)',
          phone: '+91 9876543210',
        },
      },
    },
    include: { warden: true },
  });
  console.log(`👤 Seeded Warden: ${wardenUser.email} (Dr. Alok Verma)`);

  // 4. Create Demo Student
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@college.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      isVerified: true,
      student: {
        create: {
          fullName: 'Rahul Sharma',
          rollNo: '21BCE1042',
          course: 'B.Tech Computer Science',
          year: 3,
          phone: '+91 9123456789',
          emergencyContact: '+91 9988776655',
        },
      },
    },
    include: { student: true },
  });
  console.log(`🎓 Seeded Student: ${studentUser.email} (Rahul Sharma - 21BCE1042)`);

  // 5. Create 18 Rooms (all non-AC, Single, Double, Triple, 4-Sharing)
  const roomTemplates = [
    // Block A - Ground Floor
    { roomNo: 'A-101', block: 'Block A', floor: 1, sharingType: 'single', capacity: 1, occupiedCount: 0, feePerHead: 45000, status: 'available' },
    { roomNo: 'A-102', block: 'Block A', floor: 1, sharingType: 'single', capacity: 1, occupiedCount: 1, feePerHead: 45000, status: 'full' },
    { roomNo: 'A-103', block: 'Block A', floor: 1, sharingType: 'double', capacity: 2, occupiedCount: 0, feePerHead: 32000, status: 'available' },
    { roomNo: 'A-104', block: 'Block A', floor: 1, sharingType: 'double', capacity: 2, occupiedCount: 1, feePerHead: 32000, status: 'available' },
    { roomNo: 'A-105', block: 'Block A', floor: 1, sharingType: 'triple', capacity: 3, occupiedCount: 0, feePerHead: 24000, status: 'available' },
    { roomNo: 'A-106', block: 'Block A', floor: 1, sharingType: '4-sharing', capacity: 4, occupiedCount: 2, feePerHead: 18000, status: 'available' },

    // Block A - 2nd Floor
    { roomNo: 'A-201', block: 'Block A', floor: 2, sharingType: 'single', capacity: 1, occupiedCount: 0, feePerHead: 45000, status: 'available' },
    { roomNo: 'A-202', block: 'Block A', floor: 2, sharingType: 'double', capacity: 2, occupiedCount: 0, feePerHead: 32000, status: 'available' },
    { roomNo: 'A-203', block: 'Block A', floor: 2, sharingType: 'double', capacity: 2, occupiedCount: 2, feePerHead: 32000, status: 'full' },
    { roomNo: 'A-204', block: 'Block A', floor: 2, sharingType: 'triple', capacity: 3, occupiedCount: 1, feePerHead: 24000, status: 'available' },
    { roomNo: 'A-205', block: 'Block A', floor: 2, sharingType: '4-sharing', capacity: 4, occupiedCount: 0, feePerHead: 18000, status: 'available' },
    { roomNo: 'A-206', block: 'Block A', floor: 2, sharingType: '4-sharing', capacity: 4, occupiedCount: 4, feePerHead: 18000, status: 'full' },

    // Block B - Ground Floor
    { roomNo: 'B-101', block: 'Block B', floor: 1, sharingType: 'single', capacity: 1, occupiedCount: 0, feePerHead: 45000, status: 'available' },
    { roomNo: 'B-102', block: 'Block B', floor: 1, sharingType: 'double', capacity: 2, occupiedCount: 0, feePerHead: 32000, status: 'available' },
    { roomNo: 'B-103', block: 'Block B', floor: 1, sharingType: 'triple', capacity: 3, occupiedCount: 0, feePerHead: 24000, status: 'available' },
    { roomNo: 'B-104', block: 'Block B', floor: 1, sharingType: '4-sharing', capacity: 4, occupiedCount: 1, feePerHead: 18000, status: 'available' },

    // Block B - 2nd Floor
    { roomNo: 'B-201', block: 'Block B', floor: 2, sharingType: 'double', capacity: 2, occupiedCount: 0, feePerHead: 32000, status: 'available' },
    { roomNo: 'B-202', block: 'Block B', floor: 2, sharingType: '4-sharing', capacity: 4, occupiedCount: 0, feePerHead: 18000, status: 'available' },
  ];

  for (const r of roomTemplates) {
    await prisma.room.create({ data: r });
  }

  console.log(`🏨 Seeded ${roomTemplates.length} non-AC rooms across Block A & B!`);
  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
