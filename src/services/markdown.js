// Black Poppy Canon — markdown service
// A small, dependency-free renderer. Supports the Canon's needs:
// headings, bold, italic, code, quotes, lists, checklists, tables,
// dividers, links, images. HTML is escaped first — entries are text,
// never executable.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text) {
  return text
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function renderMarkdown(src) {
  const lines = escapeHtml(src || '').split('\n');
  const out = [];
  let i = 0;
  let list = null; // 'ul' | 'ol' | 'check'

  const closeList = () => {
    if (list) {
      out.push(list === 'ol' ? '</ol>' : '</ul>');
      list = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (/^```/.test(line)) {
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; // skip closing fence
      out.push(`<pre><code>${buf.join('\n')}</code></pre>`);
      continue;
    }

    // Table: header row + separator row
    if (/^\|(.+)\|\s*$/.test(line) && /^\|[\s:-]+\|/.test(lines[i + 1] || '')) {
      closeList();
      const cells = (row) =>
        row.trim().replace(/^\||\|$/g, '').split('|').map((c) => inline(c.trim()));
      const head = cells(line);
      i += 2;
      const rows = [];
      while (i < lines.length && /^\|(.+)\|\s*$/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(
        '<table><thead><tr>' +
          head.map((h) => `<th>${h}</th>`).join('') +
          '</tr></thead><tbody>' +
          rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') +
          '</tbody></table>'
      );
      continue;
    }

    // Divider
    if (/^\s*(---+|\*\*\*+)\s*$/.test(line)) {
      closeList();
      out.push('<hr>');
      i++;
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const level = Math.min(h[1].length + 1, 6); // page h2 reserved; body starts at h3 visually via CSS
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote — lines were HTML-escaped first, so '>' arrives as '&gt;'
    if (/^&gt;\s?/.test(line)) {
      closeList();
      const buf = [];
      while (i < lines.length && /^&gt;\s?/.test(lines[i]))
        buf.push(inline(lines[i++].replace(/^&gt;\s?/, '')));
      out.push(`<blockquote>${buf.join('<br>')}</blockquote>`);
      continue;
    }

    // Checklist
    const check = line.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/);
    if (check) {
      if (list !== 'check') {
        closeList();
        out.push('<ul class="md-checklist">');
        list = 'check';
      }
      const done = check[1].toLowerCase() === 'x';
      out.push(
        `<li><input type="checkbox" disabled${done ? ' checked' : ''}> <span${done ? ' class="md-done"' : ''}>${inline(check[2])}</span></li>`
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      if (list !== 'ul') {
        closeList();
        out.push('<ul>');
        list = 'ul';
      }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      i++;
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      if (list !== 'ol') {
        closeList();
        out.push('<ol>');
        list = 'ol';
      }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`);
      i++;
      continue;
    }

    // Blank line
    if (!line.trim()) {
      closeList();
      i++;
      continue;
    }

    // Paragraph (gather consecutive lines)
    closeList();
    const buf = [line];
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^(#|&gt;|```|\||\s*[-*\d])/.test(lines[i + 1])) {
      buf.push(lines[++i]);
    }
    out.push(`<p>${inline(buf.join(' '))}</p>`);
    i++;
  }

  closeList();
  return out.join('\n');
}

export function wordCount(src) {
  const t = (src || '').trim();
  return t ? t.split(/\s+/).length : 0;
}

export function readingTime(src) {
  return Math.max(1, Math.round(wordCount(src) / 200));
}
