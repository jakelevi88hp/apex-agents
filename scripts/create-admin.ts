import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  const email = 'jakelevi88hp@gmail.com';
  const password = 'APex2025$$';
  const name = 'Jacob Dugas';

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.email, email));

    if (existing.length > 0) {
      // Update existing user to admin
      await db.update(users)
        .set({
          role: 'admin',
          passwordHash: hashedPassword,
          name: name,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));
      
      console.log('✅ Updated existing user to admin:', email);
    } else {
      // Create new admin user
      await db.insert(users).values({
        id: 'admin-jakelevi88hp',
        email,
        passwordHash: hashedPassword,
        name,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ Created new admin user:', email);
    }

    console.log('\nAdmin credentials:');
    console.log('Email:', email);
    console.log('Password: APex2025$$');
    console.log('\nYou can now login at: https://apex-agents.vercel.app/login');
    console.log('Then access AI Admin at: https://apex-agents.vercel.app/admin/ai');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

