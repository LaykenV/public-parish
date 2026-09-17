// Keep styles inline and layout tables presentational for email clients.
// Inline CSS duplicates presentational attributes because delivery clients may strip them.
// The email PNG preserves the approved pelican's transparency in light and dark themes.
const colors = {
  background: '#f7f6fa',
  ink: '#242131',
  body: '#494352',
  purple: '#6340a3',
  muted: '#6b6575',
  border: '#e2ddea',
  lavender: '#eee8f7',
}

type EmailLink = { label: string; href: string }
type EmailItem = {
  place: string
  title: string
  change: string
  source: string
  href: string
}
export type EmailTemplate = {
  siteUrl: string
  eyebrow: string
  title: string
  preview: string
  paragraphs?: string[]
  code?: string
  details?: string[]
  callout?: { title: string; text: string }
  action?: EmailLink
  sources?: string[]
  items?: EmailItem[]
  replyHint?: string
  managementUrl?: string
  unsubscribeUrl?: string
  footer?: string
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function safeUrl(value: string): string | null {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? value
      : null
  } catch {
    return null
  }
}

function link(label: string, href: string, style = ''): string {
  const url = safeUrl(href)
  return url
    ? `<a class="email-link" href="${escapeHtml(url)}" style="color:${colors.purple};text-decoration:underline;${style}">${escapeHtml(label)}</a>`
    : escapeHtml(label)
}

// Replies arrive as already formatted, citation-numbered text. Escape all prose
// and link only ordinary URLs, without interpreting generated HTML or Markdown.
function readableText(text: string): string {
  return text
    .split(/(https?:\/\/[^\s<>]+)/g)
    .map((part) => {
      if (!/^https?:\/\//.test(part))
        return escapeHtml(part).replaceAll('\n', '<br>')
      const url = part.replace(/[.,;!?]+$/, '')
      return (
        link(url, url, 'overflow-wrap:anywhere;word-break:break-word;') +
        escapeHtml(part.slice(url.length))
      )
    })
    .join('')
}

function paragraph(text: string, style = ''): string {
  return `<p class="email-copy" style="margin:0 0 18px;font-size:16px;line-height:1.6;color:${colors.body};${style}">${readableText(text)}</p>`
}

function sourceLinks(sources: string[]): string {
  return [...new Set(sources)]
    .map((href, index) => {
      const url = safeUrl(href)
      const label = url
        ? `${new URL(url).hostname.replace(/^www\./, '')} · Source ${index + 1}`
        : `Source ${index + 1} unavailable`
      return `<p style="margin:0 0 12px;font-size:14px;line-height:1.5;overflow-wrap:anywhere;word-break:break-word;">${link(label, href)}</p>`
    })
    .join('')
}

export function addEmailNotice(html: string, notice: string): string {
  return html.replace(
    '<!-- email-notice -->',
    paragraph(notice, 'padding:16px;'),
  )
}

export function renderEmail(options: EmailTemplate): string {
  const base = options.siteUrl.replace(/\/$/, '')
  const site = safeUrl(base) ?? 'https://www.publicparish.com'
  const action =
    options.action && safeUrl(options.action.href)
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border:0;border-spacing:0;margin:4px 0 24px;"><tr><td style="padding:0;"><a class="email-button" href="${escapeHtml(options.action.href)}" style="display:inline-block;background-color:${colors.lavender};color:#4f2f89;border:1px solid ${colors.purple};border-radius:8px;padding:14px 22px;font-size:16px;line-height:22px;font-weight:bold;text-align:center;text-decoration:none;">${escapeHtml(options.action.label)}</a></td></tr></table>`
      : ''
  let place = ''
  const items = (options.items ?? [])
    .map((item) => {
      const heading =
        item.place !== place
          ? `<h2 class="email-accent" style="margin:28px 0 12px;color:${colors.purple};font-size:15px;line-height:1.5;">${escapeHtml(item.place)}</h2>`
          : ''
      place = item.place
      return `${heading}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:0;border-spacing:0;"><tr><td class="email-rule" style="padding:18px 0;border-top:1px solid ${colors.border};"><p class="email-muted" style="margin:0 0 8px;font-size:12px;color:${colors.muted};">${escapeHtml(item.change)}</p><h3 style="margin:0 0 12px;font-size:20px;line-height:1.4;">${link(item.title, item.href, `color:${colors.ink};text-decoration:none;`)}</h3>${link('Read update', item.href, 'font-size:14px;font-weight:bold;')}<span style="color:${colors.border};"> &nbsp; | &nbsp; </span>${link('Official source', item.source, 'font-size:14px;')}</td></tr></table>`
    })
    .join('')
  const footerLinks = [
    options.managementUrl ? link('Manage alerts', options.managementUrl) : '',
    options.unsubscribeUrl
      ? link('Unsubscribe from all emails', options.unsubscribeUrl)
      : '',
  ]
    .filter(Boolean)
    .join(' &nbsp; · &nbsp; ')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>${escapeHtml(options.title)}</title>
<style>
:root{color-scheme:light dark;supported-color-schemes:light dark}
@media only screen and (max-width:480px){.email-outer{padding:12px 8px!important}.email-content{padding:22px!important}.email-title{font-size:24px!important}.email-brand{padding:0 16px 16px!important}}
@media (prefers-color-scheme:dark){
.email-page{background-color:#19171e!important;color:#f5f2fa!important}
.email-content{background-color:#24212b!important;border-color:#443c51!important;color:#f5f2fa!important}
.email-name,.email-title,.email-content h2,.email-content h3{color:#f5f2fa!important}
.email-copy{color:#ded8e6!important}
.email-muted,.email-footer{color:#bbb2c7!important}
.email-link,.email-accent{color:#d4b9fa!important}
.email-callout,.email-code,.email-button{background-color:#332a43!important;color:#e4d3ff!important}
.email-button{border-color:#b58ddf!important}
.email-rule{border-color:#443c51!important}
}
</style>
</head><body class="email-page" style="margin:0;padding:0;background-color:${colors.background};font-family:Arial,Helvetica,sans-serif;color:${colors.ink};-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:${colors.background};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(options.preview.slice(0, 180))}</div>
<table class="email-page" lang="en" role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${colors.background}" style="width:100%;border:0;border-spacing:0;background-color:${colors.background};color:${colors.ink};font-family:Arial,Helvetica,sans-serif;"><tr><td class="email-outer" align="center" style="padding:24px 16px;text-align:center;">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" align="center" style="width:600px;"><tr><td><![endif]-->
<table role="presentation" width="100%" align="center" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;margin:0 auto;border:0;border-spacing:0;table-layout:fixed;text-align:left;">
<tr><td><!-- email-notice --></td></tr>
<tr><td class="email-brand" style="padding:0 24px 18px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:0;border-spacing:0;"><tr><td width="64" valign="middle" style="width:64px;vertical-align:middle;padding:0 12px 0 0;"><img src="${escapeHtml(site)}/brand/pelican-email.png" width="56" height="56" alt="" style="display:block;border:0;width:56px;height:56px;"></td><td valign="middle" style="vertical-align:middle;"><a href="${escapeHtml(site)}" class="email-name" style="color:${colors.ink};font-size:22px;line-height:1.2;font-weight:bold;letter-spacing:-0.5px;text-decoration:none;">Public Parish</a><p class="email-muted" style="margin:5px 0 0;font-size:12px;line-height:1.4;color:${colors.muted};">Louisiana decisions, explained.</p></td></tr></table></td></tr>
<tr><td class="email-content" bgcolor="#ffffff" style="padding:28px;background-color:#ffffff;color:${colors.ink};border:1px solid ${colors.border};border-radius:12px;overflow-wrap:anywhere;word-break:break-word;text-align:left;">
<p class="email-accent" style="margin:0 0 12px;color:${colors.purple};font-size:12px;font-weight:bold;line-height:1.5;letter-spacing:1px;text-transform:uppercase;">${escapeHtml(options.eyebrow)}</p>
<h1 class="email-title" style="margin:0 0 20px;font-size:28px;line-height:1.25;letter-spacing:-0.5px;color:${colors.ink};">${escapeHtml(options.title)}</h1>
${(options.paragraphs ?? []).map((text) => paragraph(text)).join('')}
${options.code ? `<p class="email-code" style="margin:24px 0;padding:20px 12px;background-color:${colors.lavender};border-radius:8px;text-align:center;font-family:Consolas,monospace;font-size:34px;line-height:1.4;letter-spacing:6px;color:${colors.purple};font-weight:bold;">${escapeHtml(options.code)}</p>` : ''}
${(options.details ?? []).map((text) => paragraph(text, 'font-size:14px;margin-bottom:12px;')).join('')}
${options.callout ? `<h2 style="font-size:16px;line-height:1.5;margin:24px 0 8px;">${escapeHtml(options.callout.title)}</h2>${paragraph(options.callout.text)}` : ''}
${action}${items}
${options.sources?.length ? `<h2 class="email-rule" style="margin:24px 0 16px;padding-top:20px;border-top:1px solid ${colors.border};font-size:15px;line-height:1.5;">Official sources</h2>${sourceLinks(options.sources)}` : ''}
${options.replyHint ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border:0;border-spacing:0;margin-top:24px;"><tr><td class="email-callout" bgcolor="${colors.background}" style="padding:18px;border-radius:8px;background-color:${colors.background};"><h2 style="margin:0 0 6px;font-size:16px;line-height:1.5;">Have a question?</h2>${paragraph(options.replyHint, 'font-size:14px;margin:0;')}</td></tr></table>` : ''}
</td></tr><tr><td class="email-footer" align="center" style="padding:20px 16px;text-align:center;font-size:12px;line-height:1.8;color:${colors.muted};">
<p style="margin:0 0 10px;">${escapeHtml(options.footer ?? 'Free and nonpartisan. Built for Louisiana.')}<br>${link('Public Parish', site)}</p>
${footerLinks ? `<p style="margin:0;">${footerLinks}</p>` : ''}
</td></tr></table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}
