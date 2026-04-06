/**
 * Map Prisma/Postgres errors to safe, actionable client messages (no stack traces).
 */
function getClientDatabaseErrorMessage(error) {
  const msg = String(error?.message || '');
  const code = error?.code;

  if (/database .* does not exist/i.test(msg) || code === 'P1003') {
    return (
      'Database "finlens" does not exist yet. On your Mac, run: createdb finlens ' +
      '(or in psql: CREATE DATABASE finlens;) then from the backend folder run: npx prisma migrate dev'
    );
  }

  if (
    code === 'P1001' ||
    /Can't reach database server/i.test(msg) ||
    /connection refused/i.test(msg) ||
    (msg.includes('connect') && msg.includes('database'))
  ) {
    return (
      'Cannot connect to PostgreSQL. Start Postgres, set DATABASE_URL in backend/.env, ' +
      'then run: npx prisma migrate dev'
    );
  }

  if (/relation .* does not exist/i.test(msg) || code === 'P2021') {
    return 'Database tables are missing. From the backend folder run: npx prisma migrate dev';
  }

  return null;
}

module.exports = { getClientDatabaseErrorMessage };
