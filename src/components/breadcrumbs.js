// Black Poppy Canon — breadcrumbs (Sprint 4.5.1, Foundation Repairs)
// Orientation anywhere in the application:
//   Dashboard / Library / Visual Canon / Illustration Rules
// Every segment before the last is a link; the last names where you are.

export function Breadcrumbs(segments) {
  const nav = document.createElement('nav');
  nav.className = 'breadcrumbs';
  nav.setAttribute('aria-label', 'Breadcrumb');

  const ol = document.createElement('ol');
  ol.className = 'breadcrumbs__list';

  segments.forEach((seg, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumbs__item';
    const isLast = i === segments.length - 1;

    if (!isLast && seg.href) {
      const a = document.createElement('a');
      a.href = seg.href;
      a.textContent = seg.label;
      li.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.textContent = seg.label;
      span.setAttribute('aria-current', 'page');
      li.appendChild(span);
    }
    ol.appendChild(li);
  });

  nav.appendChild(ol);
  return nav;
}
