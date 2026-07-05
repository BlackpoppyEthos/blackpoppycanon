// Black Poppy Canon — VersionHistory
// Every save is remembered. Nothing is deleted.

export function VersionHistory(entry) {
  const el = document.createElement('section');
  el.className = 'card entry-versions';
  el.innerHTML = '<span class="eyebrow">Versions</span>';

  const versions = (entry.versions || []).slice().reverse();

  if (!versions.length) {
    el.innerHTML += '<p class="panel__empty">No versions recorded for this entry.</p>';
    return el;
  }

  const ul = document.createElement('ul');
  ul.className = 'panel__list';
  versions.forEach((v) => {
    const li = document.createElement('li');
    li.innerHTML = `<span><strong>v${v.version}</strong> — </span><span class="panel__meta"></span>`;
    li.querySelector('span').append(v.summary || 'Saved');
    li.querySelector('.panel__meta').textContent =
      `${new Date(v.timestamp).toLocaleString()} · ${v.author}`;
    ul.appendChild(li);
  });
  el.appendChild(ul);

  return el;
}
