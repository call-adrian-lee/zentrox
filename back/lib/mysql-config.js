/**
 * Shared MySQL connection options for pool, bootstrap, and scripts.
 * Set MYSQL_SOCKET on Linux (e.g. /var/run/mysqld/mysqld.sock) or MYSQL_HOST + MYSQL_PORT.
 */
function buildMysqlConnectionConfig(overrides = {}) {
  const config = {
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    ...overrides
  };
  const socketPath = process.env.MYSQL_SOCKET;
  if (socketPath) {
    config.socketPath = socketPath;
  } else {
    config.host = process.env.MYSQL_HOST || '127.0.0.1';
    config.port = Number(process.env.MYSQL_PORT || 3306);
  }
  return config;
}

module.exports = { buildMysqlConnectionConfig };
