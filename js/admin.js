/* EduSphere · admin.js */

const adUser = guardRequireAdmin();

function renderAdminTable() {
  const courses = DB.getCourses();
  const body = document.getElementById("admin-course-table");
  body.innerHTML = courses.map(c => `
    <tr>
      <td>${c.thumbnail} ${c.title}</td>
      <td>${c.category}</td>
      <td>₹${c.price}</td>
      <td>${c.syllabus.flatMap(m => m.lessons).length}</td>
      <td>★ ${courseAverageRating(c) || "—"}</td>
      <td><button class="btn btn-danger btn-sm" data-delete="${c.id}">Delete</button></td>
    </tr>
  `).join("");

  body.querySelectorAll("[data-delete]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!confirm("Delete this course? This cannot be undone.")) return;
      const remaining = DB.getCourses().filter(c => c.id !== btn.dataset.delete);
      DB.saveCourses(remaining);
      showToast("Course deleted.");
      renderAdminTable();
    });
  });
}
renderAdminTable();

const modal = document.getElementById("add-course-modal");
document.getElementById("open-add-course-btn").addEventListener("click", () => modal.classList.add("open"));
document.getElementById("close-add-modal").addEventListener("click", () => modal.classList.remove("open"));

document.getElementById("add-course-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const courses = DB.getCourses();

  const newCourse = {
    id: generateId("c"),
    title: document.getElementById("new-title").value.trim(),
    category: document.getElementById("new-category").value.trim(),
    price: Number(document.getElementById("new-price").value),
    thumbnail: "📘",
    description: document.getElementById("new-description").value.trim(),
    syllabus: [
      {
        moduleTitle: document.getElementById("new-module-title").value.trim(),
        lessons: [
          {
            id: generateId("l"),
            title: document.getElementById("new-lesson-title").value.trim(),
            duration: 5,
            content: document.getElementById("new-lesson-content").value.trim()
          }
        ]
      }
    ],
    reviews: [],
    quizzes: {}
  };
  // Give the single seed lesson a trivial placeholder quiz so quiz.html
  // and progress tracking keep working for admin-authored courses.
  const seedLessonId = newCourse.syllabus[0].lessons[0].id;
  newCourse.quizzes[seedLessonId] = {
    questions: [
      { type: "single", question: `What is the main focus of "${newCourse.title}"?`, options: [newCourse.category, "Cooking", "Astronomy", "Painting"], correct: [0] }
    ]
  };

  courses.push(newCourse);
  DB.saveCourses(courses);

  modal.classList.remove("open");
  e.target.reset();
  showToast("Course added to catalog.");
  renderAdminTable();
});
