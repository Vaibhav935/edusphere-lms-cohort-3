/* EduSphere · courses.js */

const allCourses = DB.getCourses();
const categories = [...new Set(allCourses.map(c => c.category))];
const activeUser = getCurrentUser();

const categoryBox = document.getElementById("category-checkboxes");
categoryBox.innerHTML = categories.map(cat => `
  <label class="checkbox-row"><input type="checkbox" class="cat-check" value="${cat}"> ${cat}</label>
`).join("");

const searchInput = document.getElementById("search-input");
const grid = document.getElementById("course-grid");
const countEl = document.getElementById("results-count");

function renderCourses() {
  const query = searchInput.value.trim().toLowerCase();
  const checked = [...document.querySelectorAll(".cat-check:checked")].map(c => c.value);

  const results = allCourses.filter(c => {
    const matchesText = c.title.toLowerCase().includes(query) || c.description.toLowerCase().includes(query) || c.category.toLowerCase().includes(query);
    const matchesCategory = checked.length === 0 || checked.includes(c.category);
    return matchesText && matchesCategory;
  });

  countEl.textContent = `${results.length} course${results.length === 1 ? "" : "s"} found`;
  grid.innerHTML = results.map(c => `
    <div class="course-card">
      <div class="course-thumb">${c.thumbnail}</div>
      <span class="tag">${c.category}</span>
      <h3 style="font-size:1.05rem;">${c.title}</h3>
      <p style="font-size:.85rem;">${c.description}</p>
      <div class="course-meta">
        <span>${c.syllabus.flatMap(m => m.lessons).length} lessons</span>
        <span class="rating">★ ${courseAverageRating(c) || "—"}</span>
      </div>
      <a href="course-details.html?id=${c.id}" class="btn btn-primary btn-sm">₹${c.price} · View</a>
    </div>
  `).join("") || `<p style="grid-column:1/-1;">No courses match that search.</p>`;
}

searchInput.addEventListener("input", renderCourses);
categoryBox.addEventListener("change", renderCourses);
renderCourses();

/* ---------------------------------------------------------------------
   Kanban planner — only shown to logged-in students, state saved on
   their user object as `planner: { backlog: [ids], inprogress: [], done: [] }`.
   Dragging is implemented purely with mouse events + getBoundingClientRect,
   the HTML5 Drag-and-Drop API is intentionally not used.
   --------------------------------------------------------------------- */
const kanbanSection = document.getElementById("kanban-section");

if (!activeUser) {
  kanbanSection.innerHTML = `<div class="card"><p>Log in to build your own personal course plan.</p><a href="login.html" class="btn btn-primary btn-sm">Log in</a></div>`;
} else {
  if (!activeUser.planner) {
    activeUser.planner = { backlog: allCourses.map(c => c.id), inprogress: [], done: [] };
    persistUser(activeUser);
  }

  function renderKanban() {
    ["backlog", "inprogress", "done"].forEach(col => {
      const holder = document.getElementById("col-" + col);
      holder.innerHTML = activeUser.planner[col].map(id => {
        const c = allCourses.find(cc => cc.id === id);
        if (!c) return "";
        return `<div class="kanban-card" data-id="${id}">${c.thumbnail} ${c.title}</div>`;
      }).join("");
    });
    attachDragHandlers();
  }

  function attachDragHandlers() {
    document.querySelectorAll(".kanban-card").forEach(card => {
      card.addEventListener("mousedown", onDragStart);
    });
  }

  let dragState = null;

  function onDragStart(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    dragState = {
      id: card.dataset.id,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      width: rect.width
    };
    card.classList.add("dragging");
    card.style.width = rect.width + "px";
    document.body.appendChild(card);
    moveCardTo(card, e.clientX, e.clientY);

    document.addEventListener("mousemove", onDragMove);
    document.addEventListener("mouseup", onDragEnd);
  }

  function moveCardTo(card, x, y) {
    card.style.left = (x - dragState.offsetX) + "px";
    card.style.top = (y - dragState.offsetY) + "px";
  }

  function onDragMove(e) {
    const card = document.querySelector('.kanban-card.dragging');
    if (card) moveCardTo(card, e.clientX, e.clientY);
  }

  function onDragEnd(e) {
    const card = document.querySelector('.kanban-card.dragging');
    document.removeEventListener("mousemove", onDragMove);
    document.removeEventListener("mouseup", onDragEnd);
    if (!card || !dragState) return;

    let targetCol = null;
    document.querySelectorAll(".kanban-col").forEach(col => {
      const rect = col.getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
        targetCol = col.dataset.col;
      }
    });

    card.classList.remove("dragging");
    card.style.position = "";
    card.style.left = "";
    card.style.top = "";
    card.style.width = "";

    if (targetCol) {
      ["backlog", "inprogress", "done"].forEach(col => {
        activeUser.planner[col] = activeUser.planner[col].filter(id => id !== dragState.id);
      });
      activeUser.planner[targetCol].push(dragState.id);
      persistUser(activeUser);
    }
    dragState = null;
    renderKanban();
  }

  renderKanban();
}
