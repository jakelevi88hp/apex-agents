/**
 * Update User Role Script
 * Updates a user's role in the production database
 */

import { db } from '../src/lib/db';
import { users } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

async function updateUserRole() {
  const email = 'jakelevi88hp@gmail.com';
  const newRole = 'admin';

  console.log(`Updating role for ${email} to ${newRole}...`);

  try {
    // Update the user's role
    const result = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.email, email))
      .returning({ id: users.id, email: users.email, role: users.role });

    if (result.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    console.log('✅ User role updated successfully:');
    console.log(JSON.stringify(result[0], null, 2));

    // Verify the update
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    console.log('\n✅ Verification:');
    console.log(JSON.stringify(user[0], null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    process.exit(1);
  }
}

updateUserRole();

