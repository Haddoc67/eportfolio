// --- Admin data store ---
const LS_KEY = "eportfolioData_v1";

function loadData() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
  catch { return {}; }
}
function saveData(data) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}
function uid() { return "id-" + Math.random().toString(36).slice(2, 10); }
function ensurePath(data, module, type) {
  if (!data[module]) data[module] = { posts: [], essays: [], reports: [], videos: [] };
  if (!data[module][type]) data[module][type] = [];
}

function safeReset(formEl){
  if (formEl && typeof formEl.reset === "function") { formEl.reset(); return; }
  if (formEl) formEl.querySelectorAll("input, textarea, select").forEach(el=>{
    if (el.tagName === "SELECT") el.selectedIndex = 0;
    else el.value = "";
  });
}

function buildCounts(data) {
  const out = {};
  Object.keys(data).forEach(mod => {
    out[mod] = {
      posts:   (data[mod].posts   || []).length,
      essays:  (data[mod].essays  || []).length,
      reports: (data[mod].reports || []).length,
      videos:  (data[mod].videos  || []).length
    };
  });
  return out;
}

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

function exportCounts() {
  const data = loadData();
  downloadJSON("counts.json", buildCounts(data));
}
function exportAllModules() {
  const data = loadData();
  Object.keys(data).forEach(mod => downloadJSON(`${mod}.json`, data[mod]));
}

// --- UI rendering ---
function renderList() {
  const data = loadData();
  const filterModule = document.getElementById("filterModule");
  const filterType   = document.getElementById("filterType");
  const list         = document.getElementById("list");
  if (!list) return;

  const filterModVal = filterModule ? filterModule.value : "";
  const filterTypeVal = filterType ? filterType.value : "";

  list.innerHTML = "";
  const types = ["posts","essays","reports","videos"];
  const modules = Object.keys(data).sort();

  modules.forEach(mod => {
    if (filterModVal && mod !== filterModVal) return;
    types.forEach(t => {
      if (filterTypeVal && t !== filterTypeVal) return;
      (data[mod][t] || []).forEach(item => {
        const row = document.createElement("div");
        row.className = "row";
        row.innerHTML = `
          <div>
            <div><strong>${item.title}</strong></div>
            <div class="muted">${mod} · <span class="pill pill-${t.slice(0,-1)}">${t.slice(0,-1).toUpperCase()}</span></div>
          </div>
          <div class="actions">
            <button class="btn" data-act="edit" data-id="${item.id}" data-module="${mod}" data-type="${t}">Edit</button>
            <button class="btn" data-act="del"  data-id="${item.id}" data-module="${mod}" data-type="${t}">Delete</button>
          </div>
        `;
        list.appendChild(row);
      });
    });
  });

  list.querySelectorAll("button[data-act='edit']").forEach(btn => {
    btn.addEventListener("click", () => loadIntoForm(btn.dataset.module, btn.dataset.type, btn.dataset.id));
  });
  list.querySelectorAll("button[data-act='del']").forEach(btn => {
    btn.addEventListener("click", () => removeItem(btn.dataset.module, btn.dataset.type, btn.dataset.id));
  });
}

function loadIntoForm(module, type, id) {
  const data = loadData();
  const item = (data[module][type] || []).find(x => x.id === id);
  if (!item) return;

  const f = document.getElementById("artefactForm");
  if (!f) return;

  f.querySelector("#module").value = module;
  f.querySelector("#type").value = type;
  f.querySelector("#title").value = item.title || "";
  f.querySelector("#date").value = item.date || "";
  f.querySelector("#desc").value = item.description || "";
  f.querySelector("#los").value = (item.learning_outcomes || []).join(", ");
  f.querySelector("#links").value = (item.links || []).join(", ");
  f.querySelector("#feedback").value = item.feedback || "";
  f.querySelector("#editId").value = item.id;
}

function removeItem(module, type, id) {
  const data = loadData();
  const arr = data[module][type] || [];
  const idx = arr.findIndex(x => x.id === id);
  if (idx >= 0) { arr.splice(idx, 1); saveData(data); renderList(); }
}

// --- Boot ---
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const formEl = document.getElementById("artefactForm");
  if (formEl) {
    formEl.addEventListener("submit", (e) => {
      e.preventDefault();
      const module = document.getElementById("module").value;
      const type   = document.getElementById("type").value;
      const editId = document.getElementById("editId").value;

      const item = {
        id: editId || uid(),
        title: document.getElementById("title").value.trim(),
        date:  document.getElementById("date").value,
        description: document.getElementById("desc").value.trim(),
        learning_outcomes: document.getElementById("los").value.split(",").map(s=>s.trim()).filter(Boolean),
        links: document.getElementById("links").value.split(",").map(s=>s.trim()).filter(Boolean),
        feedback: document.getElementById("feedback").value.trim()
      };

      const data = loadData();
      ensurePath(data, module, type);

      const arr = data[module][type];
      const idx = arr.findIndex(x => x.id === item.id);
      if (idx >= 0) arr[idx] = item; else arr.push(item);

      saveData(data);
      safeReset(formEl);
      const editHidden = document.getElementById("editId");
      if (editHidden) editHidden.value = "";
      renderList();
    });

    const resetBtn = document.getElementById("reset");
    if (resetBtn) resetBtn.addEventListener("click", () => {
      safeReset(formEl);
      const editHidden = document.getElementById("editId");
      if (editHidden) editHidden.value = "";
    });
  }

  const filterModule = document.getElementById("filterModule");
  const filterType   = document.getElementById("filterType");
  if (filterModule) filterModule.addEventListener("change", renderList);
  if (filterType)   filterType.addEventListener("change", renderList);

  const btnCounts = document.getElementById("exportCounts");
  const btnAll    = document.getElementById("exportAll");
  const btnClear  = document.getElementById("clearData");
  if (btnCounts) btnCounts.addEventListener("click", exportCounts);
  if (btnAll)    btnAll.addEventListener("click", exportAllModules);
  if (btnClear)  btnClear.addEventListener("click", () => { localStorage.removeItem(LS_KEY); renderList(); });

  renderList();
});
