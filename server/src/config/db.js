import mongoose from 'mongoose'

export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri || uri.includes('your_mongodb_atlas_connection_string_here')) {
    console.warn('[db] MONGODB_URI not set — starting without a database connection.')
    return
  }

  try {
    await mongoose.connect(uri)
    console.log('[db] MongoDB connected')
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
  }
}

export function getConnectionState() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  return states[mongoose.connection.readyState] ?? 'unknown'
}
