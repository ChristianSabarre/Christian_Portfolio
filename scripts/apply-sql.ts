/**
 * Applies a .sql file using the pg driver.
 * Escape hatch for environments where the Prisma migration engine cannot reach
 * the database but the application's driver adapter can.
 *
 * Usage: npx tsx scripts/apply-sql.ts prisma/migrations/0_init/migration.sql
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import { Client } from "pg";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/apply-sql.ts <path-to.sql>");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");

// Strip a UTF-8 BOM if the file was written by a Windows shell.
const sql = readFileSync(file, "utf8").replace(/^﻿/, "");

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied ${file}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
