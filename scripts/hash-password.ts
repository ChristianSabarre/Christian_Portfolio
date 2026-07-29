/**
 * Prints a bcrypt hash to paste into ADMIN_PASSWORD_HASH.
 * Usage: npm run hash-password -- "your-password"
 */
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

if (password.length < 10) {
  console.error("Choose a password of at least 10 characters.");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// A bcrypt hash contains "$", which .env parsers treat as a variable reference
// and expand to nothing. Escaping is required in a file but must NOT be used in
// the Vercel dashboard, which stores the value verbatim.
console.log("\nFor .env (dollar signs escaped — required, or the value reads as empty):\n");
console.log(`ADMIN_PASSWORD_HASH="${hash.replace(/\$/g, "\\$")}"`);
console.log("\nFor the Vercel dashboard (paste the raw value):\n");
console.log(`${hash}\n`);
