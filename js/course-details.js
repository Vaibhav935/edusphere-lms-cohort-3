/* EduSphere · course-details.js */

const cdUser = guardRequireAuth();
const params = new URLSearchParams(window.location.search);
const courseId = params.get("id");
const cdCourses = DB.getCourses();
const course = cdCourses.find(c => c.id === courseId);

if (!course) {
  document.getElementById("details-root").innerHTML = `<div class="card"><p>Course not found.</p><a href="courses.html" class="btn btn-primary btn-sm">Back to catalog</a></div>`;
} else {
  document.getElementById("course-category").textContent = course.category;
  document.getElementById("course-title").textContent = course.title;
  document.getElementById("course-description").textContent = course.description;
  document.getElementById("course-lesson-count").textContent = `${course.syllabus.flatMap(m => m.lessons).length} lessons`;
  document.getElementById("course-rating").textContent = `★ ${courseAverageRating(course) || "—"}`;

  const accordion = document.getElementById("syllabus-accordion");
  accordion.innerHTML = course.syllabus.map((mod, mIdx) => `
    <div class="accordion-item" data-idx="${mIdx}">
      <div class="accordion-header">
        <span>${mod.moduleTitle}</span>
        <span class="chev">⌄</span>
      </div>
      <div class="accordion-body">
        ${mod.lessons.map(l => `<div class="lesson-row"><span>${l.title}</span><span>${l.duration} min</span></div>`).join("")}
      </div>
    </div>
  `).join("");

  accordion.querySelectorAll(".accordion-header").forEach(header => {
    header.addEventListener("click", () => {
      header.parentElement.classList.toggle("active");
    });
  });

  const isPurchased = cdUser.purchasedCourses.includes(course.id);
  const purchaseCard = document.getElementById("purchase-card");

  function renderPurchaseCard() {
    if (isPurchased) {
      const pct = courseProgressPercent(cdUser, course.id);
      purchaseCard.innerHTML = `
        <span class="eyebrow">Enrolled</span>
        <h3 style="font-size:1.3rem;">${course.price === 0 ? "Free" : "₹" + course.price}</h3>
        <div class="bar-track" style="margin:12px 0;"><div class="bar-fill" style="width:${pct}%;"></div></div>
        <p style="font-size:.8rem;">${pct}% complete</p>
        <a href="lesson.html?course=${course.id}" class="btn btn-primary btn-block">Go to classroom</a>
      `;
    } else {
      purchaseCard.innerHTML = `
        <span class="eyebrow">Enroll</span>
        <h3 style="font-size:1.7rem;">₹${course.price}</h3>
        <p style="font-size:.82rem;">One-time payment · lifetime access · certificate on completion</p>
        <button class="btn btn-primary btn-block" id="buy-now-btn">Buy now</button>
      `;
      document.getElementById("buy-now-btn").addEventListener("click", openCheckout);
    }
  }
  renderPurchaseCard();

  /* --------------------------- Checkout modal --------------------------- */
  const modal = document.getElementById("checkout-modal");
  let appliedDiscountPercent = 0;

  function openCheckout() {
    appliedDiscountPercent = 0;
    document.getElementById("coupon-input").value = "";
    document.getElementById("coupon-input").disabled = false;
    document.getElementById("apply-coupon-btn").disabled = false;
    updateCheckoutTotals();
    modal.classList.add("open");
  }
  document.getElementById("close-modal").addEventListener("click", () => modal.classList.remove("open"));

  function updateCheckoutTotals() {
    const discount = Math.round(course.price * (appliedDiscountPercent / 100));
    document.getElementById("chk-subtotal").textContent = `₹${course.price}`;
    document.getElementById("chk-discount").textContent = `−₹${discount}`;
    document.getElementById("chk-total").textContent = `₹${course.price - discount}`;
  }

  document.getElementById("apply-coupon-btn").addEventListener("click", () => {
    const code = document.getElementById("coupon-input").value.trim().toUpperCase();
    const coupon = DB.getCoupons().find(c => c.code === code && c.active);
    if (!coupon) {
      showToast("Invalid or expired coupon.", true);
      return;
    }
    appliedDiscountPercent = coupon.discountPercent;
    updateCheckoutTotals();
    document.getElementById("coupon-input").disabled = true;
    document.getElementById("apply-coupon-btn").disabled = true;
    showToast(`Coupon applied: ${coupon.discountPercent}% off`);
  });

  document.getElementById("confirm-purchase-btn").addEventListener("click", () => {
    const discount = Math.round(course.price * (appliedDiscountPercent / 100));
    const total = course.price - discount;

    if (cdUser.wallet < total) {
      showToast("Insufficient wallet balance for this dummy checkout.", true);
      return;
    }

    cdUser.wallet -= total;
    cdUser.purchasedCourses.push(course.id);
    if (!cdUser.progress[course.id]) cdUser.progress[course.id] = {};
    persistUser(cdUser);

    modal.classList.remove("open");
    showToast("Enrolled! Redirecting to your classroom…");
    setTimeout(() => { window.location.href = `lesson.html?course=${course.id}`; }, 700);
  });

  /* ------------------------------ Reviews -------------------------------- */
  function renderReviews() {
    const list = document.getElementById("review-list");
    if (course.reviews.length === 0) {
      list.innerHTML = `<p style="font-size:.85rem;">No reviews yet — be the first.</p>`;
      return;
    }
    list.innerHTML = course.reviews.map(r => `
      <div class="card" style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:.85rem;">
          <strong>@${r.user}</strong><span class="rating">${"★".repeat(r.rating)}</span>
        </div>
        <p style="margin:6px 0 0; font-size:.85rem;">${r.text}</p>
      </div>
    `).join("");
  }
  renderReviews();

  document.getElementById("submit-review-btn").addEventListener("click", () => {
    const text = document.getElementById("review-text").value.trim();
    const rating = Number(document.getElementById("review-rating").value);
    if (!text) {
      showToast("Write a few words before posting.", true);
      return;
    }
    course.reviews.push({ user: cdUser.username, text, rating });
    const savedCourses = DB.getCourses().map(c => (c.id === course.id ? course : c));
    DB.saveCourses(savedCourses);
    document.getElementById("review-text").value = "";
    document.getElementById("course-rating").textContent = `★ ${courseAverageRating(course)}`;
    renderReviews();
    showToast("Review posted, thank you!");
  });
}
