#!/usr/bin/env node

/**
 * Vercel PostgreSQL Database Setup Script
 * This script helps set up the database for Vercel deployment
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Setting up Vercel PostgreSQL database...');

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Create admin user if it doesn't exist
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pcservices.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin',
          password: hashedPassword,
          role: 'ADMIN',
          verified: true
        }
      });
      console.log('✅ Admin user created successfully!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create sample services if they don't exist
    const servicesCount = await prisma.service.count();
    if (servicesCount === 0) {
      console.log('🛠️  Creating sample services...');
      
      const sampleServices = [
        {
          title: 'تجميع جهاز كمبيوتر',
          description: 'تجميع جهاز كمبيوتر مخصص حسب احتياجاتك',
          basePrice: 500,
          category: 'assembly',
          image: '/images/services/custom-build.jpg',
          popular: true,
          active: true
        },
        {
          title: 'إصلاح أجهزة الكمبيوتر',
          description: 'إصلاح جميع مشاكل أجهزة الكمبيوتر',
          basePrice: 100,
          category: 'repair',
          image: '/images/services/pc-fix.jpg',
          popular: true,
          active: true
        },
        {
          title: 'تحديث النظام',
          description: 'تحديث وتطوير أداء جهازك',
          basePrice: 150,
          category: 'upgrade',
          image: '/images/services/tweak.jpg',
          popular: false,
          active: true
        }
      ];

      for (const service of sampleServices) {
        await prisma.service.create({
          data: service
        });
      }
      
      console.log('✅ Sample services created successfully!');
    } else {
      console.log('ℹ️  Services already exist');
    }

    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  });