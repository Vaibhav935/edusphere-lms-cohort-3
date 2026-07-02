/* EduSphere · lesson.js */

const lsUser = guardRequireAuth();
const lsParams = new URLSearchParams(window.location.search);
const lsCourseId = lsParams.get("course");
const lsCourses = DB.getCourses();
const lsCourse = lsCourses.find(c => c.id === lsCourseId);
const root = document.getElementById("classroom-root");

if (!lsCourse || !lsUser.purchasedCourses.includes(lsCourseId)) {
  root.innerHTML = `<div class="card" style="grid-column:1/-1;"><p>You need to own this course to enter the classroom.</p><a href="courses.html" class="btn btn-primary btn-sm">Browse courses</a></div>`;
} else {
  const allLessons = lsCourse.syllabus.flatMap(m => m.lessons);
  if (!lsUser.progress[lsCourseId]) lsUser.progress[lsCourseId] = {};
  const courseProgress = lsUser.progress[lsCourseId];

  function isUnlocked(index) {
    if (index === 0) return true;
    const prev = allLessons[index - 1];
    return !!(courseProgress[prev.id] && courseProgress[prev.id].completed);
  }

  let currentId = lsParams.get("lesson");
  if (!currentId || !allLessons.find(l => l.id === currentId)) {
    const firstIncomplete = allLessons.find((l, i) => isUnlocked(i) && !(courseProgress[l.id] && courseProgress[l.id].completed));
    currentId = firstIncomplete ? firstIncomplete.id : allLessons[0].id;
  }
  const currentIndex = allLessons.findIndex(l => l.id === currentId);
  const currentLesson = allLessons[currentIndex];

  document.getElementById("cl-course-title").textContent = lsCourse.title;
  document.getElementById("cl-lesson-title").textContent = currentLesson.title;
  document.getElementById("cl-lesson-content").textContent = currentLesson.content;
  document.getElementById("go-to-quiz-link").href = `quiz.html?course=${lsCourseId}&lesson=${currentLesson.id}`;

  const listEl = document.getElementById("lesson-list");
  listEl.innerHTML = allLessons.map((l, i) => {
    const unlocked = isUnlocked(i);
    const done = courseProgress[l.id] && courseProgress[l.id].completed;
    const classes = ["lesson-list-item"];
    if (l.id === currentLesson.id) classes.push("current");
    if (!unlocked) classes.push("locked");
    return `<div class="${classes.join(" ")}" data-id="${l.id}" data-unlocked="${unlocked}">
      <span>${done ? "✅" : unlocked ? "▶" : "🔒"} ${l.title}</span><span>${l.duration}m</span>
    </div>`;
  }).join("");

  listEl.querySelectorAll(".lesson-list-item").forEach(item => {
    item.addEventListener("click", () => {
      if (item.dataset.unlocked !== "true") {
        showToast("Complete the previous lesson to unlock this one.", true);
        return;
      }
      window.location.href = `lesson.html?course=${lsCourseId}&lesson=${item.dataset.id}`;
    });
  });

  /* Simulated video: a short countdown stands in for real playback time. */
  const alreadyDone = courseProgress[currentLesson.id] && courseProgress[currentLesson.id].completed;
  const timerEl = document.getElementById("video-timer");
  const completeBtn = document.getElementById("mark-complete-btn");

  if (alreadyDone) {
    timerEl.textContent = "Complete";
    completeBtn.disabled = false;
    completeBtn.textContent = "Lesson already completed";
  } else {
    let remaining = currentLesson.duration * 2; // scaled-down simulated duration, in seconds
    timerEl.textContent = formatTimer(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      timerEl.textContent = formatTimer(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        completeBtn.disabled = false;
        timerEl.textContent = "Ready ✓";
      }
    }, 1000);
  }

  function formatTimer(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  completeBtn.addEventListener("click", () => {
    courseProgress[currentLesson.id] = { completed: true };
    persistUser(lsUser);
    showToast("Lesson complete — next one unlocked.");
    const next = allLessons[currentIndex + 1];
    setTimeout(() => {
      window.location.href = next
        ? `lesson.html?course=${lsCourseId}&lesson=${next.id}`
        : `progress.html`;
    }, 500);
  });
}
