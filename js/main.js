/* =========================================================================
   EduSphere · main.js
   Shared UI plumbing included on every authenticated page, after store.js.
   ========================================================================= */

function showToast(message, isError) {
  let el = document.getElementById("global-toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "global-toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.toggle("error", !!isError);
  el.classList.add("show");
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove("show"), 2600);
}

function initials(nameOrEmail) {
  if (!nameOrEmail) return "?";
  return nameOrEmail.trim().charAt(0).toUpperCase();
}

function renderNavbar(activePage) {
  const mount = document.getElementById("navbar-mount");
  if (!mount) return;
  const user = getCurrentUser();

  const links = user
    ? [
        ["dashboard.html", "Dashboard"],
        ["courses.html", "Courses"],
        ["progress.html", "Progress"],
        ["profile.html", "Profile"]
      ].concat(user.role === "admin" ? [["admin.html", "Admin"]] : [])
    : [
        ["index.html", "Home"],
        ["courses.html", "Courses"]
      ];

  const linkHtml = links
    .map(([href, label]) => `<a href="${href}" class="${activePage === href ? "active" : ""}">${label}</a>`)
    .join("");

  const rightHtml = user
    ? `<div class="nav-user">
         <div class="nav-avatar">${
           user.avatarBase64
             ? `<img src="${user.avatarBase64}" alt="avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`
             : initials(user.username)
         }</div>
         <button class="btn btn-ghost btn-sm" id="logout-btn">Log out</button>
       </div>`
    : `<div class="nav-user">
         <a href="login.html" class="btn btn-ghost btn-sm">Log in</a>
         <a href="register.html" class="btn btn-primary btn-sm">Sign up</a>
       </div>`;

  mount.innerHTML = `
    <a href="index.html" class="brand">
      <span class="brand-mark">ES</span> EduSphere
    </a>
    <div class="nav-links">${linkHtml}</div>
    ${rightHtml}
  `;

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      DB.clearSession();
      window.location.href = "index.html";
    });
  }
}

/* Called once right after a successful login to update the gamified streak. */
function updateLoginStreak(user) {
  const today = todayStamp();
  if (!user.streak) user.streak = { lastLogin: "", count: 0 };
  if (user.streak.lastLogin === today) {
    return user; // already counted today
  }
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  user.streak.count = user.streak.lastLogin === yesterday ? user.streak.count + 1 : 1;
  user.streak.lastLogin = today;
  persistUser(user);
  return user;
}

document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  renderNavbar(path);
});
