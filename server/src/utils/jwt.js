import jwt from 'jsonwebtoken'

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET is not set in server/.env')
  return secret
}

export function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: '7d' })
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret())
}
