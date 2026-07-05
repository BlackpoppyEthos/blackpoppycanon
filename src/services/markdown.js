// Black Poppy Canon — markdown service
// A small, honest renderer. No frameworks, no dependencies.
// Every character of source is HTML-escaped before any markup is
// generated, so entry bodies can never inject script into the Canon.

const escapeHTML = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Only quiet destinations: same-page, relative, http(s), mailto.
function safeHref(href) {
  const h = href.trim();
  if (/^(https?:|mailto:|#|\.\/|\.\.\/)/i.test(h)) return h;
  return '#';
}

/* ---------- inline markup (input is already escaped) ---------- */

function inline(text) {
  return text
    // images before links: ![alt](src)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,
      (_, alt, src) => `<img src="${safeHref(src)}" alt="${alt}" loading="lazy">`)
    // links: [text](href)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
      (_, label, href) => `<a href="${safeHref(href)}">${label}</a>`)
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // bold then italic
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/(^|\s)_([^_]+)_(?=\s|$|[.,;:!?])/g, '$1<em>$2</em>');
}

/* ---------- block-level rendering ---------- */

export function renderMarkdown(src) {
  if (!src) return '';
  const lines = escapeHTML(src.replace(/\r\n/g, '\n')).split('\n');
  const out = [];
  let i = 0;

  const isTableLine = (l) => /^\s*\|.*\|\s*$/.test(l);
  const isSeparator = (l) => /^\s*\|?\s*:?-{2,}.*\|/.test(l);

  while (i < lines.length) {
    const line = lines[i];

    // fenced code block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // closing fence
      out.push(`<pre><code${lang ? ` data-lang="${lang}"` : ''}>${buf.join('\n')}</code></pre>`);
      continue;
    }

    // horizontal rule / divider
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) { out.push('<hr>'); i++; continue; }

    // heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++; continue;
    }

    // blockquote
    if (/^\s*&gt;/.test(line)) {
      const buf = [];
      while (i < lines.length && /^\s*&gt;/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*&gt;\s?/, ''));
        i++;
      }
      out.push(`<blockquote><p>${buf.map(inline).join('<br>')}</p></blockquote>`);
      continue;
    }

    // table
    if (isTableLine(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const cells = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && isTableLine(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        '<table><thead><tr>' + head.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead>' +
        '<tbody>' + rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>'
      );
      continue;
    }

    // lists (unordered, ordered, checklists)
    const li = line.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const ordered = /\d+\./.test(li[1]);
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*([-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        let content = m[2];
        const task = content.match(/^\[( |x|X)\]\s+(.*)$/);
        if (task) {
          const done = task[1].toLowerCase() === 'x';
          content =
            `<span class="task${done ? ' task--done' : ''}">` +
            `<span class="task__box" aria-hidden="true">${done ? '✓' : ''}</span>` +
            `${inline(task[2])}</span>`;
        } else {
          content = inline(content);
        }
        items.push(`<li>${content}</li>`);
        i++;
      }
      const tag = ordered ? 'ol' : 'ul';
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    // blank line
    if (!line.trim()) { i++; continue; }

    // paragraph — gather until blank / structural line
    const buf = [line];
    i++;
    while (
      i < lines.length && lines[i].trim() &&
      !/^(#{1,6}\s|```|\s*([-*]|\d+\.)\s|\s*&gt;|\s*(---+|\*\*\*+)\s*$)/.test(lines[i]) &&
      !isTableLine(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    out.push(`<p>${buf.map(inline).join('<br>')}</p>`);
  }

  return out.join('\n');
}

/* ---------- writing metrics ---------- */

export function wordCount(src) {
  const words = (src || '').trim().split(/\s+/).filter(Boolean);
  return words.length;
}

export function readingTime(src) {
  const minutes = Math.max(1, Math.round(wordCount(src) / 200));
  return `${minutes} min read`;
}
