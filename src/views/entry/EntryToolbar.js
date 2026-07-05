// Black Poppy Canon — EntryToolbar
// Writing tools. Each button folds Markdown into the editor at the cursor.

const TOOLS = [
  { id: 'bold',     label: 'B',  title: 'Bold',        insert: ['**', '**', 'bold'] },
  { id: 'italic',   label: 'I',  title: 'Italic',      insert: ['*', '*', 'italic'] },
  { id: 'heading',  label: 'H',  title: 'Heading',     insert: ['\n## ', '', 'Heading'] },
  { id: 'quote',    label: '”',  title: 'Quote',       insert: ['\n> ', '', 'A quotation'] },
  { id: 'check',    label: '☑',  title: 'Checklist',   insert: ['\n- [ ] ', '', 'A task'] },
  { id: 'table',    label: '▦',  title: 'Table',
    insert: ['\n| Column | Column |\n| --- | --- |\n| ', ' |  |', 'cell'] },
  { id: 'image',    label: '🖼', title: 'Image',       insert: ['![', '](./assets/image.png)', 'alt text'] },
  { id: 'svg',      label: '✦',  title: 'SVG',         insert: ['![', '](./assets/symbol.svg)', 'symbol'] },
  { id: 'divider',  label: '—',  title: 'Divider',     insert: ['\n\n---\n\n', '', ''] },
  { id: 'link',     label: '🔗', title: 'Link',        insert: ['[', '](https://)', 'link text'] },
  { id: 'code',     label: '</>', title: 'Code block', insert: ['\n```\n', '\n```\n', 'code'] },
];

export function EntryToolbar({ editor, onRelationship, onPrint }) {
  const el = document.createElement('div');
  el.className = 'entry-toolbar';
  el.setAttribute('role', 'toolbar');
  el.setAttribute('aria-label', 'Writing tools');

  TOOLS.forEach((tool) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'entry-tool';
    btn.dataset.tool = tool.id;
    btn.title = tool.title;
    btn.setAttribute('aria-label', tool.title);
    btn.textContent = tool.label;
    btn.addEventListener('click', () => editor.insert(...tool.insert));
    el.appendChild(btn);
  });

  const spacer = document.createElement('span');
  spacer.className = 'entry-toolbar__spacer';
  el.appendChild(spacer);

  const rel = document.createElement('button');
  rel.type = 'button';
  rel.className = 'entry-tool';
  rel.title = 'Add relationship';
  rel.setAttribute('aria-label', 'Add relationship');
  rel.textContent = '⇄';
  rel.addEventListener('click', onRelationship);
  el.appendChild(rel);

  const print = document.createElement('button');
  print.type = 'button';
  print.className = 'entry-tool';
  print.title = 'Print (Ctrl+P)';
  print.setAttribute('aria-label', 'Print entry');
  print.textContent = '⎙';
  print.addEventListener('click', onPrint);
  el.appendChild(print);

  return el;
}
