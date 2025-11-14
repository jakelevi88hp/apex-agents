import mysql from 'mysql2/promise';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastSignedIn: string | null;
}

/**
 * Connects to the primary database and prints details about a single user.
 *
 * @returns {Promise<void>} Resolves when query logging is finished.
 */
async function check_user(): Promise<void> {
  // Read the connection string from the environment so credentials never hit source control.
  const database_url = process.env.DATABASE_URL;

  if (!database_url) {
    throw new Error('The DATABASE_URL environment variable is missing.');
  }

  // Establish a temporary connection for this single verification query.
  const connection = await mysql.createConnection(database_url);

  try {
    const [rows] = await connection.execute<UserRecord[]>(
      'SELECT id, name, email, role, createdAt, lastSignedIn FROM users WHERE email = ?',
      ['jakelevi88hp@gmail.com'],
    );

    console.log('\n=== USER QUERY RESULTS ===');
    console.log(JSON.stringify(rows, null, 2));
    console.log('=========================\n');

    if (rows.length > 0) {
      const [user] = rows;
      console.log('✓ User found!');
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Last Login: ${user.lastSignedIn ?? 'Never'}`);
    } else {
      console.log('✗ User not found');
    }
  } catch (error) {
    console.error('Failed to query the user record.', error);
    throw error;
  } finally {
    // Always tear down the connection to avoid leaking sockets.
    await connection.end();
  }
}

void check_user();

