// Black Poppy Canon — RelationshipLayer (APP-006)
// Thin charcoal lines between connected objects. The lines are not
// decorative — each one is a real relationship in the Canon; this
// layer only draws what the data already says.

export function RelationshipLayer() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'wt-lines');
  svg.setAttribute('aria-hidden', 'true');

  return {
    el: svg,
    redraw(table) {
      svg.innerHTML = '';
      const find = (id) => table.objects.find((o) => o.id === id);
      (table.connections || []).forEach((c) => {
        const a = find(c.from);
        const b = find(c.to);
        if (!a || !b) return;
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', a.x + a.w / 2);
        line.setAttribute('y1', a.y + a.h / 2);
        line.setAttribute('x2', b.x + b.w / 2);
        line.setAttribute('y2', b.y + b.h / 2);
        line.setAttribute('class', 'wt-lines__line');
        svg.appendChild(line);
      });
    },
  };
}
