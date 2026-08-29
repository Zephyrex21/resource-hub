import { timingSafeEqual, createHash } from 'crypto'

// Node's crypto.timingSafeEqual requires equal-length buffers (it throws
// otherwise), which would itself leak the target string's length via
// whether it throws — hashing both sides to a fixed-length digest first
// sidesteps that entirely, so comparison time depends only on the digest
// length, never on the input length or content.
export function timingSafeStringEqual(a, b) {
  const bufA = createHash('sha256').update(String(a)).digest()
  const bufB = createHash('sha256').update(String(b)).digest()
  return timingSafeEqual(bufA, bufB)
}
