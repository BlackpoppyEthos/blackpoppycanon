// Black Poppy Canon — EntryEditor
// The writing surface. A plain textarea, treated with respect:
// monospace-free, paper-toned, and quiet.

export function EntryEditor({ value, onInput }) {
  const wrap = document.createElement('div');
  wrap.className = 'entry-pane entry-pane--editor';

  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.setAttribute('for', 'bpc-entry-body');
  label.textContent = 'Entry body (Markdown)';

  const textarea = document.createElement('textarea');
  textarea.id = 'bpc-entry-body';
  textarea.className = 'entry-editor';
  textarea.value = value || '';
  textarea.placeholder = 'Begin. The Canon is listening…';
  textarea.setAttribute('spellcheck', 'true');
  textarea.addEventListener('input', () => onInput(textarea.value));

  wrap.append(label, textarea);

  return {
    el: wrap,
    textarea,
    getValue: () => textarea.value,
    setValue(v) {
      textarea.value = v;
      onInput(v);
    },
    // Insert a snippet at the cursor (used by the toolbar).
    insert(before, after = '', placeholder = '') {
      const { selectionStart: s, selectionEnd: e, value: v } = textarea;
      const selected = v.slice(s, e) || placeholder;
      const next = before + selected + after;
      textarea.setRangeText(next, s, e, 'end');
      if (!v.slice(s, e) && placeholder) {
        // Select the placeholder so the writer can type over it.
        textarea.setSelectionRange(s + before.length, s + before.length + placeholder.length);
      }
      textarea.focus();
      onInput(textarea.value);
    },
  };
}
