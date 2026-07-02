/* EduSphere · login.js */

const rememberedUsername = localStorage.getItem("edusphere_remembered_username");
if (rememberedUsername) {
  document.getElementById("username").value = rememberedUsername;
  document.getElementById("remember-me").checked = true;
}

function clearFieldError(fieldId) {
  document.getElementById(fieldId).classList.remove("has-error");
}
function setFieldError(fieldId) {
  document.getElementById(fieldId).classList.add("has-error");
}

document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  clearFieldError("field-username");
  clearFieldError("field-password");

  const usernameInput = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;
  const remember = document.getElementById("remember-me").checked;

  const user = DB.getUsers().find(
    u => u.username.toLowerCase() === usernameInput.toLowerCase() || u.email.toLowerCase() === usernameInput.toLowerCase()
  );

  if (!user) {
    setFieldError("field-username");
    showToast("Account not found.", true);
    return;
  }
  if (user.passwordHash !== hashPassword(password)) {
    setFieldError("field-password");
    showToast("Incorrect password.", true);
    return;
  }

  if (remember) {
    localStorage.setItem("edusphere_remembered_username", user.username);
  } else {
    localStorage.removeItem("edusphere_remembered_username");
  }

  DB.setSession({ userId: user.id });
  updateLoginStreak(user);
  window.location.href = user.role === "admin" ? "admin.html" : "dashboard.html";
});
