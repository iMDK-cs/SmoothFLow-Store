#!/usr/bin/env node

/**
 * Update User Role to Admin
 * This script updates the specific user to admin role
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  console.log('🔄 Updating user role to admin...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Target user email
    const targetEmail = 'm7md.dk7@gmail.com';

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail }
    });

    if (!user) {
      console.log(`❌ User with email ${targetEmail} not found!`);
      console.log('📋 Available users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      });
      allUsers.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) - Role: ${u.role}`);
      });
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);
    console.log(`🔐 Current role: ${user.role}`);

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: targetEmail },
      data: { 
        role: 'ADMIN',
        verified: true
      }
    });

    console.log('✅ User role updated successfully!');
    console.log(`📧 Email: ${updatedUser.email}`);
    console.log(`👤 Name: ${updatedUser.name}`);
    console.log(`🔐 New Role: ${updatedUser.role}`);
    console.log(`✅ Verified: ${updatedUser.verified ? 'Yes' : 'No'}`);

    // Verify the update
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true, verified: true }
    });

    console.log('\n🔍 All Admin Users:');
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.name} (${admin.email}) - Role: ${admin.role} - Verified: ${admin.verified ? 'Yes' : 'No'}`);
    });

    console.log('\n🎉 User role update completed successfully!');

  } catch (error) {
    console.error('❌ Failed to update user role:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  });