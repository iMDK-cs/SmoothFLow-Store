#!/usr/bin/env node

/**
 * Create Admin User
 * This script creates an admin user for testing
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔧 Creating admin user...\n');
    
    const adminEmail = process.env.ADMIN_EMAIL_SETUP || 'admin@smoothflow.com';
    const adminPassword = process.env.ADMIN_PASSWORD_SETUP || (() => {
      console.error('❌ ADMIN_PASSWORD_SETUP environment variable is required for security');
      process.exit(1);
    })();
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Role: ${existingAdmin.role}`);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
        verified: true
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`👤 Role: ${admin.role}`);
    console.log('\n⚠️  Please change the password after first login!');
    console.log('\n🔒 Password was set from ADMIN_PASSWORD_SETUP environment variable');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();