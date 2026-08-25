// Generic request-body validator: pass any zod schema, get back an Express
// middleware. On success, req.body is replaced with the *parsed* data (so
// defaults from the schema — e.g. difficulty defaulting to 'beginner' —
// are applied consistently, not left to Mongoose's own schema defaults to
// handle inconsistently across create vs. update). On failure, responds
// with the same `{ error: "..." }` shape the rest of the API already uses,
// so callers don't need special-case handling for validation errors.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const message = result.error.issues.map((issue) => issue.message).join('; ')
      return res.status(400).json({ error: message })
    }
    req.body = result.data
    next()
  }
}
