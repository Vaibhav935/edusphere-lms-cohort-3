/* EduSphere · quiz.js */

const qzUser = guardRequireAuth();
const qzParams = new URLSearchParams(window.location.search);
const qzCourseId = qzParams.get("course");
const qzLessonId = qzParams.get("lesson");
const qzCourses = DB.getCourses();
const qzCourse = qzCourses.find(c => c.id === qzCourseId);
const qzBody = document.getElementById("quiz-body");
const lockCard = document.getElementById("lock-card");
const resultCard = document.getElementById("result-card");

if (!qzCourse || !qzCourse.quizzes[qzLessonId]) {
  qzBody.innerHTML = `<div class="card"><p>No quiz found for this lesson.</p><a href="dashboard.html" class="btn btn-primary btn-sm">Back to dashboard</a></div>`;
} else {
  const lesson = qzCourse.syllabus.flatMap(m => m.lessons).find(l => l.id === qzLessonId);
  document.getElementById("quiz-course-name").textContent = qzCourse.title;
  document.getElementById("quiz-lesson-name").textContent = `Quiz · ${lesson.title}`;
  document.getElementById("back-to-lesson-btn").href = `lesson.html?course=${qzCourseId}&lesson=${qzLessonId}`;

  if (!qzUser.progress[qzCourseId]) qzUser.progress[qzCourseId] = {};
  if (!qzUser.progress[qzCourseId][qzLessonId]) qzUser.progress[qzCourseId][qzLessonId] = { completed: false };
  const entry = qzUser.progress[qzCourseId][qzLessonId];

  const quiz = qzCourse.quizzes[qzLessonId];

  function isLocked() {
    return entry.quizLockedUntil && entry.quizLockedUntil > Date.now();
  }

  function renderQuestions() {
    qzBody.style.display = "block";
    lockCard.style.display = "none";
    resultCard.style.display = "none";

    qzBody.innerHTML = quiz.questions.map((q, qIdx) => `
      <div class="card" style="margin-bottom:16px;">
        <p style="color:var(--text); font-weight:600;">${qIdx + 1}. ${q.question} <span class="tag">${q.type === "multi" ? "select all that apply" : "single choice"}</span></p>
        ${q.options.map((opt, oIdx) => `
          <label class="quiz-option">
            <input type="${q.type === "multi" ? "checkbox" : "radio"}" name="q${qIdx}" value="${oIdx}">
            <span>${opt}</span>
          </label>
        `).join("")}
      </div>
    `).join("") + `<button class="btn btn-primary btn-block" id="submit-quiz-btn">Submit quiz</button>`;

    document.getElementById("submit-quiz-btn").addEventListener("click", evaluateQuiz);
  }

  function evaluateQuiz() {
    let correctCount = 0;
    quiz.questions.forEach((q, qIdx) => {
      const selected = [...document.querySelectorAll(`input[name="q${qIdx}"]:checked`)].map(i => Number(i.value));
      const isCorrect =
        selected.length === q.correct.length &&
        q.correct.every(c => selected.includes(c)) &&
        selected.every(s => q.correct.includes(s));
      if (isCorrect) correctCount++;
    });

    const scorePercent = Math.round((correctCount / quiz.questions.length) * 100);
    entry.lastScore = scorePercent;

    if (scorePercent >= 70) {
      entry.quizLockedUntil = null;
      persistUser(qzUser);
      showResult(true, scorePercent);
    } else {
      entry.quizLockedUntil = Date.now() + 2 * 60 * 1000;
      persistUser(qzUser);
      showLockout();
    }
  }

  function showResult(passed, score) {
    qzBody.style.display = "none";
    lockCard.style.display = "none";
    resultCard.style.display = "block";
    document.getElementById("result-heading").textContent = passed ? "Quiz passed ✅" : "Quiz not passed";
    document.getElementById("result-detail").textContent = `You scored ${score}%.`;
  }

  function showLockout() {
    qzBody.style.display = "none";
    resultCard.style.display = "none";
    lockCard.style.display = "block";
    tickCooldown();
  }

  function tickCooldown() {
    const retryBtn = document.getElementById("retry-btn");
    const timerEl = document.getElementById("cooldown-timer");
    retryBtn.disabled = true;

    const interval = setInterval(() => {
      const remainingMs = entry.quizLockedUntil - Date.now();
      if (remainingMs <= 0) {
        clearInterval(interval);
        timerEl.textContent = "00:00";
        retryBtn.disabled = false;
        retryBtn.classList.add("btn-primary");
        return;
      }
      const totalSec = Math.ceil(remainingMs / 1000);
      const m = Math.floor(totalSec / 60).toString().padStart(2, "0");
      const s = (totalSec % 60).toString().padStart(2, "0");
      timerEl.textContent = `${m}:${s}`;
    }, 1000);

    retryBtn.addEventListener("click", () => {
      if (retryBtn.disabled) return;
      entry.quizLockedUntil = null;
      persistUser(qzUser);
      renderQuestions();
    });
  }

  if (isLocked()) {
    showLockout();
  } else {
    renderQuestions();
  }
}
