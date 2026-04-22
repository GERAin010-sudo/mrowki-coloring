#!/usr/bin/env node
/**
 * CLI to create or update a login+password for a CRM user.
 *
 * Usage:
 *   node setup-password.js list
 *   node setup-password.js set --user <id_or_telegram_id_or_imie> --login <login> --password <pwd>
 *   node setup-password.js create --telegram <tg_id> --name <name> --role admin --login <login> --password <pwd>
 *
 * Examples:
 *   node setup-password.js list
 *   node setup-password.js set --user 1 --login gera --password SuperPass123
 *   node setup-password.js create --telegram 123456 --name "Oleksandr" --role admin --login admin --password S3cret
 */

const path = require('path');
const crypto = require('crypto');
const CRMDatabase = require('./database');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

// Parse args: --key value
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      out[k] = v;
    } else if (!out._cmd) out._cmd = a;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._cmd;

const db = new CRMDatabase();

function findUser(token) {
  if (!token) return null;
  // Try id first
  if (/^\d+$/.test(token)) {
    const u = db.getUserById(parseInt(token));
    if (u) return u;
  }
  // Then telegram_id or imie
  const byTg = db.db.prepare('SELECT * FROM uzytkownicy WHERE telegram_id = ?').get(String(token));
  if (byTg) return byTg;
  const byName = db.db.prepare("SELECT * FROM uzytkownicy WHERE imie = ?").get(String(token));
  if (byName) return byName;
  const byLogin = db.getUserByLogin(String(token));
  if (byLogin) return byLogin;
  return null;
}

(async () => {
  try {
    if (!cmd || cmd === 'help' || cmd === '--help') {
      console.log(`
Usage:
  node setup-password.js list
  node setup-password.js set --user <id|telegram_id|imie|login> --login <login> --password <pwd>
  node setup-password.js create --telegram <tg_id> --name <name> --role admin|wlasciciel|wykonawca --login <login> --password <pwd>

Examples:
  node setup-password.js list
  node setup-password.js set --user Oleksandr --login oleks --password SuperPass123
  node setup-password.js create --telegram 123456 --name "Admin" --role admin --login admin --password ChangeMe123
`);
      process.exit(0);
    }

    if (cmd === 'list') {
      const rows = db.db.prepare("SELECT id, telegram_id, imie, rola, aktywny, login, last_login_at FROM uzytkownicy ORDER BY id").all();
      console.table(rows);
      process.exit(0);
    }

    if (cmd === 'set') {
      const user = findUser(args.user);
      if (!user) { console.error('❌ User not found:', args.user); process.exit(1); }
      if (!args.password) { console.error('❌ --password required'); process.exit(1); }
      if (args.login) db.setUserLogin(user.id, args.login);
      db.setUserPassword(user.id, hashPassword(args.password));
      console.log(`✅ Updated: id=${user.id} imie="${user.imie}" login=${args.login || user.login || '(unchanged)'}`);
      process.exit(0);
    }

    if (cmd === 'create') {
      if (!args.telegram || !args.name || !args.login || !args.password) {
        console.error('❌ Required: --telegram <id> --name <name> --login <login> --password <pwd>');
        process.exit(1);
      }
      const role = args.role || 'wykonawca';
      // Create user via existing method
      const u = db.createUser(String(args.telegram), String(args.name), role);
      const userId = u.lastInsertRowid || findUser(args.telegram)?.id;
      if (!userId) { console.error('❌ User creation failed'); process.exit(1); }
      db.setUserLogin(userId, args.login);
      db.setUserPassword(userId, hashPassword(args.password));
      console.log(`✅ Created: id=${userId} name="${args.name}" telegram=${args.telegram} role=${role} login=${args.login}`);
      process.exit(0);
    }

    console.error('❌ Unknown command:', cmd);
    process.exit(1);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
