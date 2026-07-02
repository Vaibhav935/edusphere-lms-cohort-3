/* EduSphere · register.js */

function toggleFieldError(fieldId, hasError) {
  document.getElementById(fieldId).classList.toggle("has-error", hasError);
}

function isValidEmailFormat(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isStrongPassword(value) {
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  return value.length >= 8 && hasNumber && hasSpecial;
}

document.getElementById("register-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  const users = DB.getUsers();
  let valid = true;

  const usernameTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  toggleFieldError("field-username", username.length < 3 || usernameTaken);
  if (username.length < 3 || usernameTaken) valid = false;

  const emailTaken = users.some(u => u.email.toLowerCase() === email.toLowerCase());
  const emailOk = isValidEmailFormat(email) && !emailTaken;
  toggleFieldError("field-email", !emailOk);
  if (!emailOk) valid = false;

  const passwordOk = isStrongPassword(password);
  toggleFieldError("field-password", !passwordOk);
  if (!passwordOk) valid = false;

  toggleFieldError("field-confirm", password !== confirm || confirm.length === 0);
  if (password !== confirm || confirm.length === 0) valid = false;

  if (!valid) {
    showToast("Please fix the highlighted fields.", true);
    return;
  }

  const newUser = {
    id: generateId("u"),
    username,
    email,
    passwordHash: hashPassword(password),
    role: "student",
    purchasedCourses: [],
    progress: {},
    wallet: 5000,
    streak: { lastLogin: "", count: 0 },
    avatarBase64: "",
    theme: "aurora",
    joinedDate: todayStamp()
  };

  users.push(newUser);
  DB.saveUsers(users);
  DB.setSession({ userId: newUser.id });
  updateLoginStreak(newUser);
  showToast("Account created — welcome to EduSphere!");
  setTimeout(() => { window.location.href = "dashboard.html"; }, 600);
});
