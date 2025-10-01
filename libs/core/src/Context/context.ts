export type Context = {
  services?: Map<string, any>
  concurrency?: number | 'unbounded'
}
