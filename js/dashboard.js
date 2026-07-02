/* EduSphere · dashboard.js */

const user = guardRequireAuth();
const courses = DB.getCourses();

document.getElementById("welcome-heading").textContent = `Welcome back, ${user.username}`;

const purchased = courses.filter(c => user.purchasedCourses.includes(c.id));
const completionRates = purchased.map(c => courseProgressPercent(user, c.id));
const completedCount = completionRates.filter(p => p === 100).length;
const avgCompletion = completionRates.length
  ? Math.round(completionRates.reduce((sum, p) => sum + p, 0) / completionRates.length)
  : 0;

document.getElementById("stat-purchased").textContent = purchased.length;
document.getElementById("stat-completed").textContent = completedCount;
document.getElementById("stat-avg").textContent = avgCompletion + "%";
document.getElementById("stat-streak").textContent = `${(user.streak && user.streak.count) || 0} 🔥`;

const feed = document.getElementById("activity-feed");
if (purchased.length === 0) {
  feed.innerHTML = `<div class="card" style="grid-column:1/-1;">
    <p>You haven't purchased any courses yet. Head to the course catalog to pick your first one.</p>
    <a href="courses.html" class="btn btn-primary btn-sm">Explore courses</a>
  </div>`;
} else {
  feed.innerHTML = purchased.map(c => {
    const pct = courseProgressPercent(user, c.id);
    return `
      <div class="course-card">
        <div class="course-thumb">${c.thumbnail}</div>
        <h3 style="font-size:1rem;">${c.title}</h3>
        <progress value="${pct}" max="100"></progress>
        <div class="course-meta"><span>${pct}% complete</span><span>${c.category}</span></div>
        <a href="lesson.html?course=${c.id}" class="btn btn-primary btn-sm">${pct === 100 ? "Review course" : "Resume lesson"}</a>
      </div>
    `;
  }).join("");
}
