/** Youngsville's official accessible meeting pages omit the HTTP type header. */
export function municodeDeclaredHtmlType(url: string, rawHtml: unknown): string | null {
  let parsed: URL
  try { parsed = new URL(url) } catch { return null }
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'meetings.municode.com' || parsed.pathname !== '/adaHtmlDocument/index' || parsed.searchParams.get('cc') !== 'YOUNGSVILA' || typeof rawHtml !== 'string') return null
  if (!/^\s*<!doctype html>\s*<html\b[^>]*>\s*<head\b[^>]*>/i.test(rawHtml)) return null
  const head = rawHtml.slice(0, 4096).split(/<\/head\s*>/i)[0]
  const declarations = [...head.matchAll(/<meta\b[^>]*>/gi)].map(match => match[0]).filter(tag => /\bhttp-equiv\s*=\s*["']content-type["']/i.test(tag))
  if (declarations.length !== 1 || !/\bcontent\s*=\s*["']text\/html(?:\s*;\s*charset\s*=\s*utf-8)?["']/i.test(declarations[0])) return null
  return 'text/html; charset=utf-8'
}
