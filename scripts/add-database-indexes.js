#!/usr/bin/env node

/**
 * Add Database Indexes Script
 * This script adds indexes directly to the database for better performance
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDatabaseIndexes() {
  console.log('🚀 Adding database indexes...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // List of indexes to create
    const indexes = [
      {
        name: 'carts_user_id_idx',
        table: 'carts',
        columns: ['userId'],
        unique: true,
        sql: 'CREATE UNIQUE INDEX IF NOT EXISTS carts_user_id_idx ON carts ("userId")'
      },
      {
        name: 'cart_items_cart_id_idx',
        table: 'cart_items',
        columns: ['cartId'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS cart_items_cart_id_idx ON cart_items ("cartId")'
      },
      {
        name: 'cart_items_service_id_idx',
        table: 'cart_items',
        columns: ['serviceId'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS cart_items_service_id_idx ON cart_items ("serviceId")'
      },
      {
        name: 'cart_items_composite_idx',
        table: 'cart_items',
        columns: ['cartId', 'serviceId', 'optionId'],
        unique: true,
        sql: 'CREATE UNIQUE INDEX IF NOT EXISTS cart_items_composite_idx ON cart_items ("cartId", "serviceId", "optionId")'
      },
      {
        name: 'services_category_idx',
        table: 'services',
        columns: ['category'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS services_category_idx ON services (category)'
      },
      {
        name: 'services_active_available_idx',
        table: 'services',
        columns: ['active', 'available'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS services_active_available_idx ON services (active, available)'
      },
      {
        name: 'services_popular_idx',
        table: 'services',
        columns: ['popular'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS services_popular_idx ON services (popular)'
      },
      {
        name: 'users_email_idx',
        table: 'users',
        columns: ['email'],
        unique: true,
        sql: 'CREATE UNIQUE INDEX IF NOT EXISTS users_email_idx ON users (email)'
      },
      {
        name: 'users_role_idx',
        table: 'users',
        columns: ['role'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS users_role_idx ON users (role)'
      },
      {
        name: 'orders_user_id_idx',
        table: 'orders',
        columns: ['userId'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS orders_user_id_idx ON orders ("userId")'
      },
      {
        name: 'orders_status_idx',
        table: 'orders',
        columns: ['status'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status)'
      },
      {
        name: 'orders_created_at_idx',
        table: 'orders',
        columns: ['createdAt'],
        unique: false,
        sql: 'CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders ("createdAt")'
      }
    ];

    console.log('📊 Creating indexes...');
    
    for (const index of indexes) {
      try {
        console.log(`Creating index: ${index.name}`);
        
        // Execute the SQL directly
        await prisma.$executeRawUnsafe(index.sql);
        
        console.log(`✅ Created index: ${index.name}`);
        
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`⚠️  Index ${index.name} already exists`);
        } else {
          console.error(`❌ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Test performance after adding indexes
    console.log('\n⚡ Testing performance after adding indexes...');
    
    const startTime = Date.now();
    
    // Test service lookup
    const services = await prisma.service.findMany({
      where: { active: true, available: true },
      select: {
        id: true,
        title: true,
        available: true,
        stock: true,
        active: true
      },
      take: 10
    });
    
    const serviceTime = Date.now() - startTime;
    console.log(`✅ Service lookup after indexes: ${serviceTime}ms`);

    // Test cart query
    const testUser = await prisma.user.findFirst({
      where: { role: 'USER' }
    });

    if (testUser) {
      const cartStart = Date.now();
      
      const cart = await prisma.cart.findUnique({
        where: { userId: testUser.id },
        include: {
          items: {
            include: {
              service: {
                select: {
                  id: true,
                  title: true,
                  basePrice: true,
                  image: true
                }
              },
              option: {
                select: {
                  id: true,
                  title: true,
                  price: true
                }
              }
            }
          }
        }
      });
      
      const cartTime = Date.now() - cartStart;
      console.log(`✅ Cart query after indexes: ${cartTime}ms`);
    }

    console.log('\n🎉 Database indexes added successfully!');
    
    // Show index information
    console.log('\n📋 Indexes created:');
    indexes.forEach(index => {
      console.log(`- ${index.name} on ${index.table} (${index.columns.join(', ')})`);
    });

  } catch (error) {
    console.error('❌ Failed to add indexes:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

addDatabaseIndexes()
  .catch((e) => {
    console.error('❌ Index creation failed:', e);
    process.exit(1);
  });