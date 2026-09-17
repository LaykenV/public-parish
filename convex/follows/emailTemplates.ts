// Keep styles inline and layout tables presentational for email clients.
// The existing PNG has the approved 3D pelican on the same lavender background.
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
    ? `<a href="${escapeHtml(url)}" style="color:${colors.purple};text-decoration:underline;${style}">${escapeHtml(label)}</a>`
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
  return `<p style="margin:0 0 20px;font-size:16px;line-height:1.65;color:${colors.body};${style}">${readableText(text)}</p>`
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
    paragraph(notice, 'padding:16px;background:#eee8f7;'),
  )
}

export function renderEmail(options: EmailTemplate): string {
  const base = options.siteUrl.replace(/\/$/, '')
  const site = safeUrl(base) ?? 'https://www.publicparish.com'
  const action =
    options.action && safeUrl(options.action.href)
      ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:8px 0 28px;"><tr><td bgcolor="${colors.purple}" style="border-radius:8px;text-align:center;">${link(options.action.label, options.action.href, 'display:inline-block;padding:15px 24px;border:1px solid #6340a3;border-radius:8px;color:#ffffff;font-size:16px;line-height:22px;font-weight:bold;text-decoration:none;mso-padding-alt:0;')}</td></tr></table>`
      : ''
  let place = ''
  const items = (options.items ?? [])
    .map((item) => {
      const heading =
        item.place !== place
          ? `<h2 style="margin:28px 0 12px;color:${colors.purple};font-size:15px;line-height:1.5;">${escapeHtml(item.place)}</h2>`
          : ''
      place = item.place
      return `${heading}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td style="padding:18px 0;border-top:1px solid ${colors.border};"><p style="margin:0 0 8px;font-size:12px;color:${colors.muted};">${escapeHtml(item.change)}</p><h3 style="margin:0 0 12px;font-size:20px;line-height:1.4;">${link(item.title, item.href, `color:${colors.ink};text-decoration:none;`)}</h3>${link('Read update', item.href, 'font-size:14px;font-weight:bold;')}<span style="color:${colors.border};"> &nbsp; | &nbsp; </span>${link('Official source', item.source, 'font-size:14px;')}</td></tr></table>`
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
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(options.title)}</title>
<style>@media only screen and (max-width:480px){.email-outer{padding:12px 8px!important}.email-content{padding:24px!important}.email-brand{padding:20px 24px!important}.email-title{font-size:25px!important}.email-pelican{width:80px!important;height:80px!important}.email-name{font-size:23px!important}}</style>
</head><body style="margin:0;padding:0;background:${colors.background};font-family:Arial,Helvetica,sans-serif;color:${colors.ink};-webkit-text-size-adjust:100%;">
<div style="display:none;font-size:1px;line-height:1px;color:${colors.background};max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeHtml(options.preview.slice(0, 180))}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" bgcolor="${colors.background}"><tr><td class="email-outer" align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;table-layout:fixed;">
<tr><td><!-- email-notice --></td></tr>
<tr><td class="email-brand" style="padding:12px 32px 24px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td valign="middle"><a href="${escapeHtml(site)}" class="email-name" style="color:${colors.ink};font-size:28px;line-height:1.2;font-weight:bold;letter-spacing:-1px;text-decoration:none;">Public Parish</a><p style="margin:9px 0 0;font-size:13px;line-height:1.5;color:${colors.muted};">Louisiana decisions.<br>The documents behind them.</p></td><td width="104" align="right" valign="middle"><img class="email-pelican" src="${escapeHtml(site)}/apple-touch-icon.png" width="104" height="104" alt="" style="display:block;border:0;width:104px;height:104px;"></td></tr></table></td></tr>
<tr><td class="email-content" bgcolor="#ffffff" style="padding:32px;border:1px solid ${colors.border};border-radius:16px;overflow-wrap:anywhere;word-break:break-word;">
<p style="margin:0 0 14px;color:${colors.purple};font-size:12px;font-weight:bold;line-height:1.5;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(options.eyebrow)}</p>
<h1 class="email-title" style="margin:0 0 24px;font-size:30px;line-height:1.22;letter-spacing:-0.7px;color:${colors.ink};">${escapeHtml(options.title)}</h1>
${(options.paragraphs ?? []).map((text) => paragraph(text)).join('')}
${options.code ? `<p style="margin:24px 0;padding:20px 12px;background:${colors.lavender};border-radius:8px;text-align:center;font-family:Consolas,monospace;font-size:34px;line-height:1.4;letter-spacing:6px;color:${colors.purple};font-weight:bold;">${escapeHtml(options.code)}</p>` : ''}
${(options.details ?? []).map((text) => paragraph(text, 'font-size:14px;margin-bottom:12px;')).join('')}
${options.callout ? `<h2 style="font-size:16px;line-height:1.5;margin:24px 0 8px;">${escapeHtml(options.callout.title)}</h2>${paragraph(options.callout.text)}` : ''}
${action}${items}
${options.sources?.length ? `<h2 style="margin:28px 0 16px;padding-top:24px;border-top:1px solid ${colors.border};font-size:15px;line-height:1.5;">Official sources</h2>${sourceLinks(options.sources)}` : ''}
${options.replyHint ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:24px;"><tr><td bgcolor="${colors.background}" style="padding:20px;border-radius:8px;"><h2 style="margin:0 0 6px;font-size:16px;line-height:1.5;">Have a question?</h2>${paragraph(options.replyHint, 'font-size:14px;margin:0;')}</td></tr></table>` : ''}
</td></tr><tr><td align="center" style="padding:24px 20px;font-size:12px;line-height:1.8;color:${colors.muted};">
<p style="margin:0 0 10px;">${escapeHtml(options.footer ?? 'Free and nonpartisan. Built for Louisiana.')}<br>${link('Public Parish', site)}</p>
${footerLinks ? `<p style="margin:0;">${footerLinks}</p>` : ''}
</td></tr></table><!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>`
}
