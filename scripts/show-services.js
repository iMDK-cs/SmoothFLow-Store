#!/usr/bin/env node

/**
 * Show All Services in Database
 * This script displays all services currently stored in the database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function showServices() {
  try {
    console.log('🔍 Fetching all services from database...\n');
    
    // Get all services with their options
    const services = await prisma.service.findMany({
      include: {
        options: true,
        _count: {
          select: {
            orderItems: true
          }
        }
      },
      orderBy: {
        category: 'asc'
      }
    });

    if (services.length === 0) {
      console.log('⚠️  No services found in database');
      console.log('💡 Run: npm run db:migrate-services to upload services');
      return;
    }

    // Group services by category
    const categories = {};
    services.forEach(service => {
      if (!categories[service.category]) {
        categories[service.category] = [];
      }
      categories[service.category].push(service);
    });

    console.log(`📊 Total Services: ${services.length}\n`);

    // Display services by category
    Object.entries(categories).forEach(([category, categoryServices]) => {
      console.log(`\n🏷️  Category: ${category.toUpperCase()}`);
      console.log('═'.repeat(50));
      
      categoryServices.forEach((service, index) => {
        console.log(`\n${index + 1}. ${service.title}`);
        console.log(`   ID: ${service.id}`);
        console.log(`   Description: ${service.description}`);
        console.log(`   Base Price: ${service.basePrice} ريال`);
        console.log(`   Popular: ${service.popular ? '⭐ Yes' : 'No'}`);
        console.log(`   Active: ${service.active ? '✅ Yes' : '❌ No'}`);
        console.log(`   Available: ${service.available ? '✅ Yes' : '❌ No'}`);
        console.log(`   Orders: ${service._count.orderItems}`);
        
        if (service.options && service.options.length > 0) {
          console.log('   Options:');
          service.options.forEach(option => {
            console.log(`     • ${option.title}: +${option.price} ريال`);
            console.log(`       ${option.description}`);
          });
        }
      });
    });

    // Summary statistics
    const stats = {
      total: services.length,
      popular: services.filter(s => s.popular).length,
      active: services.filter(s => s.active).length,
      available: services.filter(s => s.available).length,
      withOptions: services.filter(s => s.options.length > 0).length
    };

    console.log('\n📈 Statistics:');
    console.log('═'.repeat(30));
    console.log(`Total Services: ${stats.total}`);
    console.log(`Popular Services: ${stats.popular}`);
    console.log(`Active Services: ${stats.active}`);
    console.log(`Available Services: ${stats.available}`);
    console.log(`Services with Options: ${stats.withOptions}`);

    // Category breakdown
    console.log('\n📊 By Category:');
    Object.entries(categories).forEach(([category, categoryServices]) => {
      console.log(`${category}: ${categoryServices.length} services`);
    });

  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

showServices();