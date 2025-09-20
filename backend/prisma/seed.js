import { PrismaClient } from '../generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Database seed script
 * Creates default roles and admin user
 */
async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Create default roles
    const roles = [
      {
        name: 'admin',
        scope: null, // Global scope
      },
      {
        name: 'manager',
        scope: 'management',
      },
      {
        name: 'hr',
        scope: 'hr',
      },
      {
        name: 'user',
        scope: null, // Default role for new users
      },
      {
        name: 'auditor',
        scope: 'audit',
      },
    ];

    console.log('📝 Creating roles...');
    for (const roleData of roles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name }
      });

      if (!existingRole) {
        await prisma.role.create({
          data: roleData
        });
        console.log(`✅ Created role: ${roleData.name}`);
      } else {
        console.log(`⚠️  Role already exists: ${roleData.name}`);
      }
    }

    // Create default admin user
    const adminEmail = 'admin@erp-system.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!existingAdmin) {
      const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' }
      });

      if (adminRole) {
        const hashedPassword = await bcrypt.hash('Admin123!', 12);
        
        await prisma.user.create({
          data: {
            email: adminEmail,
            password: hashedPassword,
            firstName: 'System',
            lastName: 'Administrator',
            roleId: adminRole.id,
            isActive: true,
          }
        });
        console.log('✅ Created default admin user');
        console.log(`📧 Email: ${adminEmail}`);
        console.log('🔑 Password: Admin123!');
        console.log('⚠️  Please change the default password after first login!');
      } else {
        console.log('❌ Admin role not found, cannot create admin user');
      }
    } else {
      console.log('⚠️  Admin user already exists');
    }

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
