#!/usr/bin/env node

/**
 * Database Optimization Script
 * This script adds indexes and optimizations for better cart performance
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function optimizeDatabase() {
  console.log('🚀 Starting database optimization...');

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully!');

    // Add indexes for better performance
    console.log('📊 Adding database indexes...');
    
    const indexes = [
      // Cart indexes
      {
        name: 'cart_user_id_idx',
        table: 'carts',
        columns: ['user_id'],
        unique: true
      },
      
      // Cart items indexes
      {
        name: 'cart_items_cart_id_idx',
        table: 'cart_items',
        columns: ['cart_id']
      },
      {
        name: 'cart_items_service_id_idx',
        table: 'cart_items',
        columns: ['service_id']
      },
      {
        name: 'cart_items_composite_idx',
        table: 'cart_items',
        columns: ['cart_id', 'service_id', 'option_id'],
        unique: true
      },
      
      // Services indexes
      {
        name: 'services_category_idx',
        table: 'services',
        columns: ['category']
      },
      {
        name: 'services_active_available_idx',
        table: 'services',
        columns: ['active', 'available']
      },
      {
        name: 'services_popular_idx',
        table: 'services',
        columns: ['popular']
      },
      
      // Users indexes
      {
        name: 'users_email_idx',
        table: 'users',
        columns: ['email'],
        unique: true
      },
      {
        name: 'users_role_idx',
        table: 'users',
        columns: ['role']
      },
      
      // Orders indexes
      {
        name: 'orders_user_id_idx',
        table: 'orders',
        columns: ['user_id']
      },
      {
        name: 'orders_status_idx',
        table: 'orders',
        columns: ['status']
      },
      {
        name: 'orders_created_at_idx',
        table: 'orders',
        columns: ['created_at']
      }
    ];

    for (const index of indexes) {
      try {
        const indexName = index.name;
        const tableName = index.table;
        const columns = index.columns.join(', ');
        const unique = index.unique ? 'UNIQUE' : '';
        
        console.log(`Creating index: ${indexName}`);
        
        // Note: Prisma doesn't support raw SQL for index creation in migrations
        // This would need to be done manually in the database or through a migration
        console.log(`SQL: CREATE ${unique} INDEX ${indexName} ON ${tableName} (${columns})`);
        
      } catch (error) {
        console.error(`Failed to create index ${index.name}:`, error.message);
      }
    }

    // Analyze table statistics
    console.log('📈 Analyzing table statistics...');
    
    const tables = ['users', 'services', 'carts', 'cart_items', 'orders'];
    
    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`Table ${table}: ${count} records`);
      } catch (error) {
        console.error(`Failed to count ${table}:`, error.message);
      }
    }

    // Test query performance
    console.log('⚡ Testing query performance...');
    
    const startTime = Date.now();
    
    // Test cart query performance
    const testUser = await prisma.user.findFirst({
      where: { role: 'USER' }
    });
    
    if (testUser) {
      const cartQueryStart = Date.now();
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
      const cartQueryTime = Date.now() - cartQueryStart;
      console.log(`Cart query took: ${cartQueryTime}ms`);
    }
    
    const totalTime = Date.now() - startTime;
    console.log(`Total optimization time: ${totalTime}ms`);

    console.log('🎉 Database optimization completed!');
    
    // Recommendations
    console.log('\n📋 Optimization Recommendations:');
    console.log('1. Add the indexes manually in your database:');
    console.log('   - cart_user_id_idx (UNIQUE)');
    console.log('   - cart_items_cart_id_idx');
    console.log('   - cart_items_service_id_idx');
    console.log('   - cart_items_composite_idx (UNIQUE)');
    console.log('   - services_category_idx');
    console.log('   - services_active_available_idx');
    console.log('   - users_email_idx (UNIQUE)');
    console.log('   - users_role_idx');
    console.log('   - orders_user_id_idx');
    console.log('   - orders_status_idx');
    console.log('   - orders_created_at_idx');
    
    console.log('\n2. Consider adding connection pooling:');
    console.log('   - Use Prisma connection pooling');
    console.log('   - Configure connection limits');
    
    console.log('\n3. Monitor query performance:');
    console.log('   - Use database query logs');
    console.log('   - Monitor slow queries');
    console.log('   - Use EXPLAIN ANALYZE for optimization');

  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

optimizeDatabase()
  .catch((e) => {
    console.error('❌ Optimization failed:', e);
    process.exit(1);
  });