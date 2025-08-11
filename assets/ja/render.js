// Render artefacts on a module page from assets/data/<slug>.json
document.addEventListener('DOMContentLoaded', async () => {
  // Derive module slug from the URL, e.g., module-network-security.html -> module-network-security
  const slug = location.pathname.split('/').pop().replace(/\.html$/,'');
  const dataUrl = `assets/data/${slug}.json`;

  // Where to render
  const postsEl   = document.querySelector('#tab-posts');
  const essaysEl  = document.querySelector('#tab-essays');
  const reportsEl = document.querySelector('#tab-reports');
  const videosEl  = document.querySelector('#tab-videos');

  // Helper: render one item
  function renderItem(item) {
    const wrap = document.createElement('article');
    wrap.className = 'artefact';
    const los = (item.learning_outcomes || []).join(', ');
    const links = (item.links || []).map(href => {
      const a = document.createElement('a');
      a.href = href;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = href.split('/').pop() || href;
      return a;
    });

    wrap.innerHTML = `
      <h3>${item.title || '(Untitled)'}</h3>
      <p>${item.description || ''}</p>
      <ul>
        ${item.date ? `<li><strong>Date:</strong> ${item.date}</li>` : ''}
        ${los ? `<li><strong>Learning Outcomes:</strong> ${los}</li>` : ''}
        ${links.length ? `<li><strong>Links:</strong> <span class="links-holder"></span></li>` : ''}
      </ul>
      ${item.feedback ? `<details><summary>Feedback</summary><p>${item.feedback}</p></details>` : ''}
    `;
    if (links.length) {
      const holder = wrap.querySelector('.links-holder');
      links.forEach((a, i) => {
        holder.appendChild(a);
        if (i < links.length - 1) holder.appendChild(document.createTextNode(' · '));
      });
    }
    return wrap;
  }

  // Fetch JSON; if missing, we leave placeholders
  let data = null;
  try {
    const r = await fetch(dataUrl, { cache: 'no-store' });
    if (r.ok) data = await r.json();
  } catch(e) { /* ignore */ }

  if (!data) return; // no data file yet

  // Map types to panels
  const map = [
    ['posts', postsEl],
    ['essays', essaysEl],
    ['reports', reportsEl],
    ['videos', videosEl]
  ];

  map.forEach(([key, panel]) => {
    if (!panel) return;
    const items = (data[key] || []);
    if (items.length === 0) return; // keep placeholder; main.js will hide empty tabs

    // Clear placeholder
    const empty = panel.querySelector('.empty');
    if (empty) empty.remove();

    // Add items
    items.forEach(item => panel.appendChild(renderItem(item)));
  });

  // main.js’ logik skjuler automatisk tomme faner efter vi har fyldt indhold på.
});
