// Usage: npm run hash-password -- "yourPassword"
// Prints a bcrypt hash to paste into server/.env as ADMIN_PASSWORD_HASH.
import bcrypt from 'bcryptjs'

const password = process.argv[2]

if (!password) {
  console.error('Usage: npm run hash-password -- "yourPassword"')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 10)
console.log('\nAdd this line to server/.env:\n')
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`)
