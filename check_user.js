/* eslint-disable @typescript-eslint/no-require-imports */
const mysql = require('mysql2/promise');

async function checkUser() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const [rows] = await connection.execute(
      'SELECT id, name, email, role, createdAt, lastSignedIn FROM users WHERE email = ?',
      ['jakelevi88hp@gmail.com']
    );
    
    console.log('\n=== USER QUERY RESULTS ===');
    console.log(JSON.stringify(rows, null, 2));
    console.log('=========================\n');
    
    if (rows.length > 0) {
      console.log('✓ User found!');
      console.log(`  Email: ${rows[0].email}`);
      console.log(`  Name: ${rows[0].name}`);
      console.log(`  Role: ${rows[0].role}`);
      console.log(`  Created: ${rows[0].createdAt}`);
      console.log(`  Last Login: ${rows[0].lastSignedIn}`);
    } else {
      console.log('✗ User not found');
    }
  } finally {
    await connection.end();
  }
}

checkUser().catch(console.error);
