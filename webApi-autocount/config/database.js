import sql from "mssql/msnodesqlv8.js";
import logger from "../middleware/logger.js";

const server   = process.env.DB_SERVER;
const instance = process.env.DB_INSTANCE;
const database = process.env.DB_DATABASE;

const serverFull = instance ? `${server}\\${instance}` : server;

// Windows Authentication — tiada username/password diperlukan
const connectionString =
  `Driver={SQL Server Native Client 11.0};` +
  `Server=${serverFull};` +
  `Database=${database};` +
  `Trusted_Connection=yes;` +
  `TrustServerCertificate=yes;`;

const dbConfig = {
  connectionString,
  pool: {
    max:               parseInt(process.env.DB_POOL_MAX, 10)          || 10,
    min:               parseInt(process.env.DB_POOL_MIN, 10)          || 0,
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT, 10) || 30000,
  },
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT, 10) || 30000,
};

let pool = null;

export async function getPool() {
  if (pool) {
    return pool;
  }

  try {
    pool = await sql.connect(dbConfig);
    logger.info(`SQL Server connected → ${serverFull} / ${database}`);

    pool.on("error", (err) => {
      logger.error("SQL Server pool error:", err);
      pool = null;
    });

    return pool;
  } catch (err) {
    logger.error(`Failed to connect to SQL Server: ${err.message}`);
    throw err;
  }
}

export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    logger.info("SQL Server connection pool closed.");
  }
}

export { sql };
