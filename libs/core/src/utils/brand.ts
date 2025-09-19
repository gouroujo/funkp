export type Branded<K, T> = K & { __brand: T }

export function brand<K, T>(k: K, brand: T): Branded<K, T> {
  return Object.assign(k, { __brand: brand })
}
