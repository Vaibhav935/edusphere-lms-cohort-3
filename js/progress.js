/* EduSphere · progress.js */

const prUser = guardRequireAuth();
const prCourses = DB.getCourses();
const owned = prCourses.filter(c => prUser.purchasedCourses.includes(c.id));

const coursesZone = document.getElementById("progress-courses");
const certZone = document.getElementById("certificate-zone");

if (owned.length === 0) {
  coursesZone.innerHTML = `<div class="card"><p>Enroll in a course to start tracking analytics.</p><a href="courses.html" class="btn btn-primary btn-sm">Browse courses</a></div>`;
} else {
  coursesZone.innerHTML = owned.map(c => {
    const lessons = c.syllabus.flatMap(m => m.lessons);
    const userCourseProgress = prUser.progress[c.id] || {};
    const rows = lessons.map(l => {
      const entry = userCourseProgress[l.id];
      const score = entry && typeof entry.lastScore === "number" ? entry.lastScore : null;
      return `
        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:.82rem; margin-bottom:4px;">
            <span>${l.title}</span><span>${score === null ? "Not attempted" : score + "%"}</span>
          </div>
          <div class="bar-track"><div class="bar-fill" style="width:${score || 0}%;"></div></div>
        </div>
      `;
    }).join("");

    return `<div class="card" style="margin-bottom:18px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
        <h3 style="font-size:1.05rem; margin:0;">${c.thumbnail} ${c.title}</h3>
        <span class="tag">${courseProgressPercent(prUser, c.id)}% complete</span>
      </div>
      ${rows}
    </div>`;
  }).join("");
}

function makeValidationHash(username, courseId) {
  const raw = `${username}::${courseId}::${Date.now()}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) { h = (h << 5) - h + raw.charCodeAt(i); h |= 0; }
  return "ES-" + Math.abs(h).toString(36).toUpperCase();
}

const completedCourses = owned.filter(c => courseProgressPercent(prUser, c.id) === 100);

if (completedCourses.length === 0) {
  certZone.innerHTML = `<p style="grid-column:1/-1; color:var(--text-muted); font-size:.85rem;">Complete every lesson in a course to unlock its certificate.</p>`;
} else {
  let userDirty = false;
  certZone.innerHTML = completedCourses.map(c => {
    if (!prUser.progress[c.id].certificateHash) {
      prUser.progress[c.id].certificateHash = makeValidationHash(prUser.username, c.id);
      prUser.progress[c.id].certificateDate = todayStamp();
      userDirty = true;
    }
    return `
      <div class="certificate">
        <div class="eyebrow">EduSphere · Certificate of Completion</div>
        <h3 style="font-size:1.3rem;">${c.title}</h3>
        <p style="margin:12px 0;">Awarded to <strong style="color:var(--text);">${prUser.username}</strong><br>on ${prUser.progress[c.id].certificateDate}</p>
        <div class="mono" style="font-size:.78rem; color:var(--accent-2);">${prUser.progress[c.id].certificateHash}</div>
      </div>
    `;
  }).join("");
  if (userDirty) persistUser(prUser);
}
