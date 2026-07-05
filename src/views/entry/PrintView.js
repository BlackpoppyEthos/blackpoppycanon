// Black Poppy Canon — PrintView
// An entry prints like a page from a well-loved journal:
// book title and entry title above, version and the Canon's mark below,
// no browser chrome, generous margins. The footer repeats on every page.

export function attachPrintChrome(container, { bookTitle, entryTitle, version }) {
  const head = document.createElement('div');
  head.className = 'print-chrome print-chrome--head';
  head.setAttribute('aria-hidden', 'true');
  head.innerHTML = `<span></span><span></span>`;
  head.children[0].textContent = bookTitle || 'The Black Poppy Canon';
  head.children[1].textContent = entryTitle || '';

  const foot = document.createElement('div');
  foot.className = 'print-chrome print-chrome--foot';
  foot.setAttribute('aria-hidden', 'true');
  foot.innerHTML = `<span></span><span>11:11</span><span></span>`;
  foot.children[0].textContent = `Black Poppy Canon · v${version || 1}`;
  foot.children[2].textContent = new Date().toLocaleDateString();

  container.prepend(head);
  container.appendChild(foot);
}

export function printPage() {
  window.print();
}
