
// Run the code only after the HTML document has fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // 1) Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // 2) Evidence tabs: hide empty tabs/panels and whole tab-block if all are empty
  document.querySelectorAll("#evidence").forEach(section => {
    const tabs = section.querySelector(".tabs");
    const panelsWrap = section.querySelector(".tab-panels");
    if (!tabs || !panelsWrap) return;

    let links = Array.from(tabs.querySelectorAll(".tab-link"));
    let panels = Array.from(panelsWrap.querySelectorAll(".tab-panel"));

    // Remove tabs/panels that only contain the "empty" placeholder
    links.forEach((link, i) => {
      const panel = panels[i];
      if (!panel) return;
      const onlyEmpty = panel.children.length === 1 && panel.querySelector(".empty");
      if (onlyEmpty) {
        link.remove();
        panel.remove();
      }
    });

    // Refresh lists after removals
    links = Array.from(tabs.querySelectorAll(".tab-link"));
    panels = Array.from(panelsWrap.querySelectorAll(".tab-panel"));

    // If nothing left, remove tabs and show a single empty message
    if (links.length === 0) {
      tabs.remove();
      panelsWrap.innerHTML = '<p class="empty">No artefacts available yet.</p>';
      return;
    }

    // Default: activate first tab
    links[0].classList.add("active");
    panels[0].classList.add("active");

    // Tab switching
    links.forEach(link => {
      link.addEventListener("click", () => {
        links.forEach(l => l.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        link.classList.add("active");
        const targetSel = link.dataset.target;
        const target = targetSel ? document.querySelector(targetSel) : null;
        if (target) target.classList.add("active");
      });
    });
  });

  // 3) Module tiles: optional count badges on index page
  // If assets/data/counts.json exists, we will fetch it and show totals per module.
  // File format example:
  // {
  //   "module-network-security": { "posts": 2, "essays": 1, "reports": 0, "videos": 1 },
  //   "module-introduction": { "posts": 3, "essays": 0, "reports": 1, "videos": 0 }
  // }
  const tiles = document.querySelectorAll(".modules-grid .tile");
  if (tiles.length) {
    fetch("assets/data/counts.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return; // counts.json not present – skip quietly
        tiles.forEach(tile => {
          const href = tile.getAttribute("href") || "";
          const slug = href.replace(/\.html$/i, ""); // e.g., "module-network-security"
          const counts = data[slug];
          if (!counts) return;

          // Sum all categories
          const total =
            (counts.posts || 0) +
            (counts.essays || 0) +
            (counts.reports || 0) +
            (counts.videos || 0);

          // Create or update a badge element on the tile
          let badge = tile.querySelector(".badge");
          if (!badge) {
            badge = document.createElement("span");
            badge.className = "badge";
            tile.appendChild(badge);
          }
          badge.textContent = total;
          badge.title = `Posts: ${counts.posts || 0} · Essays: ${counts.essays || 0} · Reports: ${counts.reports || 0} · Videos: ${counts.videos || 0}`;
        });
      })
      .catch(() => { /* no-op if file missing */ });
  }

});
