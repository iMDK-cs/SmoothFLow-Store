const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAvailabilitySchema() {
  try {
    console.log('🔄 Updating availability schema...');

    // Add availabilityStatus column with default value
    await prisma.$executeRaw`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS "availabilityStatus" TEXT DEFAULT 'available'
    `;

    // Add availabilityUpdatedAt column
    await prisma.$executeRaw`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS "availabilityUpdatedAt" TIMESTAMP
    `;

    // Create availability_history table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "availability_history" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "serviceId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "oldStatus" TEXT NOT NULL,
        "newStatus" TEXT NOT NULL,
        "reason" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `;

    // Create index for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "availability_history_serviceId_idx" 
      ON "availability_history"("serviceId")
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "availability_history_userId_idx" 
      ON "availability_history"("userId")
    `;

    // Set Ready PC Builds as unavailable by default
    const readyBuildsServices = await prisma.service.findMany({
      where: {
        OR: [
          { title: { contains: 'تجميعات PC جاهزة' } },
          { title: { contains: 'Ready PC Builds' } },
          { id: 'ready-builds' }
        ]
      }
    });

    console.log(`📦 Found ${readyBuildsServices.length} Ready PC Build services`);

    for (const service of readyBuildsServices) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          available: false,
          availabilityStatus: 'out_of_stock',
          availabilityUpdatedAt: new Date()
        }
      });
      console.log(`✅ Updated ${service.title} to unavailable`);
    }

    // Update all other services to have proper availability status using raw SQL
    await prisma.$executeRaw`
      UPDATE services 
      SET "availabilityStatus" = 'available' 
      WHERE "availabilityStatus" IS NULL OR "availabilityStatus" = ''
    `;

    console.log('✅ Availability schema updated successfully!');
    console.log('📊 Summary:');
    console.log('   - Added availabilityStatus column');
    console.log('   - Added availabilityUpdatedAt column');
    console.log('   - Created availability_history table');
    console.log('   - Set Ready PC Builds as unavailable');
    console.log('   - Updated all services with proper status');

  } catch (error) {
    console.error('❌ Error updating availability schema:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateAvailabilitySchema()
  .then(() => {
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });