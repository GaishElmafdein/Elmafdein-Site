// Deterministic PRNG utilities to avoid SSR/CSR hydration mismatches
// Mulberry32: small fast seeded generator
export function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function randRange(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min)
}
