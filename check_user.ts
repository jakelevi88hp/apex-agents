import mysql from 'mysql2/promise';

interface UserRecord {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  createdAt: string | Date;
  lastSignedIn: string | Date | null;
}

const TARGET_EMAIL = 'jakelevi88hp@gmail.com';

/**
 * Connects to the database and prints information about the target user.
 *
 * @throws {Error} When the database connection fails or the query cannot execute.
 */
async function checkUser(): Promise<void> {
  const connection = await mysql.createConnection(process.env.DATABASE_URL ?? '');

  try {
    const [rows] = await connection.execute<UserRecord[]>(
      'SELECT id, name, email, role, createdAt, lastSignedIn FROM users WHERE email = ?',
      [TARGET_EMAIL]
    );

    console.log('\n=== USER QUERY RESULTS ===');
    console.log(JSON.stringify(rows, null, 2));
    console.log('=========================\n');

    if (rows.length > 0) {
      const user = rows[0];
      console.log('✓ User found!');
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name ?? 'N/A'}`);
      console.log(`  Role: ${user.role ?? 'N/A'}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Last Login: ${user.lastSignedIn ?? 'Never'}`);
    } else {
      console.log('✗ User not found');
    }
  } finally {
    await connection.end();
  }
}

void checkUser().catch((error: unknown) => {
  console.error('Failed to query user:', error);
  process.exitCode = 1;
});

