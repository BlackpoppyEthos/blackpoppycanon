// Black Poppy Canon — EntryToolbar
// Bold, italic, heading, quote, checklist, table, image, SVG,
// divider, link, code, print. Each button speaks markdown.

const ACTIONS = [
  { id: 'bold',      label: 'B',  title: 'Bold',        wrap: ['**', '**'] },
  { id: 'italic',    label: 'I',  title: 'Italic',      wrap: ['*', '*'] },
  { id: 'heading',   label: 'H',  title: 'Heading',     prefix: '## ' },
  { id: 'quote',     label: '"',  title: 'Quote',       prefix: '> ' },
  { id: 'checklist', label: '☑',  title: 'Checklist',   prefix: '- [ ] ' },
  { id: 'table',     label: '▦',  title: 'Table',       block: '| Column | Column |\n| --- | --- |\n| cell | cell |' },
  { id: 'image',     label: '🖼', title: 'Image',       block: '![alt text](image-url)' },
  { id: 'svg',       label: '◈',  title: 'SVG',         block: '![symbol](./icon.svg)' },
  { id: 'divider',   label: '—',  title: 'Divider',     block: '\n---\n' },
  { id: 'link',      label: '⌁',  title: 'Link',        wrap: ['[', '](url)'] },
  { id: 'code',      label: '{}', title: 'Code block',  block: '```\ncode\n```' },
];

export function EntryToolbar(textarea, { onInput, onPrint }) {
  const el = document.createElement('div');
  el.className = 'entry-toolbar no-print';
  el.setAttribute('role', 'toolbar');
  el.setAttribute('aria-label', 'Formatting');

  function apply(action) {
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e);
    let insert;
    let cursor;

    if (action.wrap) {
      insert = action.wrap[0] + (selected || 'text') + action.wrap[1];
      cursor = s + insert.length;
    } else if (action.prefix) {
      insert = '\n' + action.prefix + (selected || '');
      cursor = s + insert.length;
    } else {
      insert = '\n' + action.block + '\n';
      cursor = s + insert.length;
    }

    textarea.value = value.slice(0, s) + insert + value.slice(e);
    textarea.focus();
    textarea.setSelectionRange(cursor, cursor);
    onInput();
  }

  ACTIONS.forEach((a) => {
    const btn = document.createElement('button');
    btn.className = 'entry-toolbar__btn';
    btn.type = 'button';
    btn.title = a.title;
    btn.setAttribute('aria-label', a.title);
    btn.textContent = a.label;
    btn.addEventListener('click', () => apply(a));
    el.appendChild(btn);
  });

  const spacer = document.createElement('span');
  spacer.className = 'entry-toolbar__spacer';
  el.appendChild(spacer);

  const print = document.createElement('button');
  print.className = 'entry-toolbar__btn';
  print.type = 'button';
  print.title = 'Print (Ctrl+P)';
  print.setAttribute('aria-label', 'Print');
  print.textContent = '⎙';
  print.addEventListener('click', onPrint);
  el.appendChild(print);

  return el;
}
