#!/usr/bin/env node

/**
 * Update Admin Information
 * This script updates the admin user information
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAdminInfo() {
  console.log('🔄 Updating admin information...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // New admin information
    const newAdminEmail = 'm7md.dk7@gmail.com';
    const newAdminPassword = '96045Mdk';
    const newAdminName = 'Admin';

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newAdminPassword, 12);

    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      // Update existing admin
      console.log('👤 Updating existing admin user...');
      
      const updatedAdmin = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: newAdminEmail,
          name: newAdminName,
          password: hashedPassword,
          role: 'ADMIN',
          verified: true
        }
      });

      console.log('✅ Admin user updated successfully!');
      console.log(`📧 New Email: ${updatedAdmin.email}`);
      console.log(`👤 New Name: ${updatedAdmin.name}`);
      console.log(`🔑 New Password: ${newAdminPassword}`);
      console.log(`🔐 Role: ${updatedAdmin.role}`);

    } else {
      // Create new admin user
      console.log('👤 Creating new admin user...');
      
      const newAdmin = await prisma.user.create({
        data: {
          email: newAdminEmail,
          name: newAdminName,
          password: hashedPassword,
          role: 'ADMIN',
          verified: true
        }
      });

      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${newAdmin.email}`);
      console.log(`👤 Name: ${newAdmin.name}`);
      console.log(`🔑 Password: ${newAdminPassword}`);
      console.log(`🔐 Role: ${newAdmin.role}`);
    }

    // Verify the update
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    console.log('\n🔍 Verification:');
    console.log(`✅ Admin found: ${adminUser ? 'Yes' : 'No'}`);
    if (adminUser) {
      console.log(`📧 Email: ${adminUser.email}`);
      console.log(`👤 Name: ${adminUser.name}`);
      console.log(`🔐 Role: ${adminUser.role}`);
      console.log(`✅ Verified: ${adminUser.verified ? 'Yes' : 'No'}`);
    }

    console.log('\n🎉 Admin information updated successfully!');

  } catch (error) {
    console.error('❌ Failed to update admin information:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminInfo()
  .catch((e) => {
    console.error('❌ Update failed:', e);
    process.exit(1);
  });