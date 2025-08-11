// Simple admin data model stored in localStorage, with export to JSON files.
// Later, you upload those JSON files to assets/data/ in GitHub.

const LS_KEY = "eportfolioData_v1";

// Load data from localStorage or start empty
function loadData() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}

// Save to localStorage
function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

// Create a predictable ID
function uid() {
  return "id-" + Math.random().toString(36).slice(2, 10);
}

// Ensure module/type arrays exist
function ensurePath(data, module, type) {
  if (!data[module]) data[module] = { posts: [], essays: [], reports: [], videos: [] };
  if (!data[module][type]) data[module][type] = [];
}

// Rebuild list UI
function renderList() {
  const data = loadData();
  const filterModule = document.getElementById("filterModule").value;
  const filterType = document.getElementById("filterType").value;
  const list = document.getElementById("list");
  list.innerHTML = "";

  const types = ["posts","essays","reports","videos"];
  const modules = Object.keys(data).sort();

  modules.forEach(mod => {
    if (filterModule && mod !== filterModule) return;

    types.forEach(t => {
      if (filterType && t !== filterType) return;

      const arr = data[mod][t] || [];
      arr.forEach(item => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div>
            <div><strong>${item.title}</strong></div>
            <div class="muted">${mod} · <span class="pill pill-${t.slice(0,-1)}">${t.slice(0,-1).toUpperCase()}</span></div>
          </div>
          <div class="actions">
            <button class="btn" data-act="edit" data-id="${item.id}" data-module="${mod}" data-type="${t}">Edit</button>
            <button class="btn" data-act="del" data-id="${item.id}" data-module="${mod}" data-type="${t}">Delete</button>
          </div>
        `;
        list.appendChild(row);
      });
    });
  });

  // Wire buttons
  list.querySelectorAll("button[data-act='edit']").forEach(btn => {
    btn.addEventListener("click", () => loadIntoForm(btn.dataset.module, btn.dataset.type, btn.dataset.id));
  });
  list.querySelectorAll("button[data-act='del']").forEach(btn => {
    btn.addEventListener("click", () => removeItem(btn.dataset.module, btn.dataset.type, btn.dataset.id));
  });
}

// Load item into form for editing
function loadIntoForm(module, type, id) {
  const data = loadData();
  const item = (data[module][type] || []).find(x => x.id === id);
  if (!item) return;

  document.getElementById("module").value = module;
  document.getElementById("type").value = type;
  document.getElementById("title").value = item.title || "";
  document.getElementById("date").value = item.date || "";
  document.getElementById("desc").value = item.description || "";
  document.getElementById("los").value = (item.learning_outcomes || []).join(", ");
  document.getElementById("links").value = (item.links || []).join(", ");
  document.getElementById("feedback").value = item.feedback || "";
  document.getElementById("editId").value = item.id;
}

// Remove item
function removeItem(module, type, id) {
  const data = loadData();
  const arr = data[module][type] || [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) {
    arr.splice(idx, 1);
    saveData(data);
    renderList();
  }
}

// Build counts.json from current data
function buildCounts(data) {
  const out = {};
  Object.keys(data).forEach(mod => {
    out[mod] = {
      posts: (data[mod].posts || []).length,
      essays: (data[mod].essays || []).length,
      reports: (data[mod].reports || []).length,
      videos: (data[mod].videos || []).length
    };
  });
  return out;
}

// Download helper
function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

// Export counts.json
function exportCounts() {
  const data = loadData();
  downloadJSON("counts.json", buildCounts(data));
}

// Export all modules as separate JSON files
function exportAllModules() {
  const data = loadData();
  Object.keys(data).forEach(mod => {
    downloadJSON(`${mod}.json`, data[mod]);
  });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Form handlers
  const form = document.getElementById("artefactForm");
  const resetBtn = document.getElementById("reset");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const module = document.getElementById("module").value;
    const type = document.getElementById("type").value;
    const editId = document.getElementById("editId").value;

    const item = {
      id: editId || uid(),
      title: document.getElementById("title").value.trim(),
      date: document.getElementById("date").value,
      description: document.getElementById("desc").value.trim(),
      learning_outcomes: document.getElementById("los").value.split(",").map(s => s.trim()).filter(Boolean),
      links: document.getElementById("links").value.split(",").map(s => s.trim()).filter(Boolean),
      feedback: document.getElementById("feedback").value.trim()
    };

    const data = loadData();
    ensurePath(data, module, type);

    // Update or insert
    const arr = data[module][type];
    const idx = arr.findIndex(x => x.id === item.id);
    if (idx >= 0) arr[idx] = item; else arr.push(item);

    saveData(data);
    form.reset();
    document.getElementById("editId").value = "";
    renderList();
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    document.getElementById("editId").value = "";
  });

  // Filters
  document.getElementById("filterModule").addEventListener("change", renderList);
  document.getElementById("filterType").addEventListener("change", renderList);

  // Export buttons
  document.getElementById("exportCounts").addEventListener("click", exportCounts);
  document.getElementById("exportAll").addEventListener("click", exportAllModules);
  document.getElementById("clearData").addEventListener("click", () => {
    localStorage.removeItem(LS_KEY);
    renderList();
  });

  renderList();
});
