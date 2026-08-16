import { createClient } from '@supabase/supabase-js'

let client = null

function getClient() {
  if (client) return client
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  client = createClient(url, key)
  return client
}

export async function uploadFile(buffer, filename, mimetype) {
  const supabase = getClient()

  if (!supabase) {
    const err = new Error(
      'File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in ' +
        "server/.env, or use the admin panel's \"Paste URL\" mode instead.",
    )
    err.status = 501
    throw err
  }

  const bucket = process.env.SUPABASE_BUCKET || 'resource-hub-files'
  const path = `${Date.now()}-${filename.replace(/\s+/g, '-')}`

  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    contentType: mimetype,
    upsert: false,
  })

  if (error) {
    const err = new Error(`Upload failed: ${error.message}`)
    err.status = 502
    throw err
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
