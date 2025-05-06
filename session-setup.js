import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// SQL from connect-pg-simple README
const createTableQuery = `
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`;

pool.query(createTableQuery)
  .then(() => {
    console.log('Session table created successfully');
    pool.end();
  })
  .catch(err => {
    console.error('Error creating session table:', err);
    pool.end();
  });