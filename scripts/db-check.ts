/** Quick connectivity/latency probe. Usage: npx tsx scripts/db-check.ts */
import "dotenv/config";
import { Client } from "pg";

async function main() {
  const started = Date.now();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const connected = Date.now();
  const res = await client.query('SELECT COUNT(*)::int AS n FROM "Project"');
  console.log(
    `connect ${connected - started}ms | query ${Date.now() - connected}ms | projects ${res.rows[0].n}`,
  );
  await client.end();
}

main().catch((e) => {
  console.error("FAIL:", e.message);
  process.exit(1);
});
