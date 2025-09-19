const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setAdminRole() {
  try {
    // Get user email from command line argument
    const userEmail = process.argv[2]
    
    if (!userEmail) {
      console.log('Usage: node scripts/set-admin-role.js <user-email>')
      process.exit(1)
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    })

    if (!user) {
      console.log(`User with email ${userEmail} not found`)
      process.exit(1)
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role: 'ADMIN' }
    })

    console.log(`✅ User ${userEmail} has been set as ADMIN`)
    console.log(`User ID: ${updatedUser.id}`)
    console.log(`User Name: ${updatedUser.name}`)
    console.log(`User Role: ${updatedUser.role}`)
    
  } catch (error) {
    console.error('Error setting admin role:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setAdminRole()