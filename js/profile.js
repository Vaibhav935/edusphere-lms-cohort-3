/* EduSphere · profile.js */

const pfUser = guardRequireAuth();

document.getElementById("det-username").textContent = pfUser.username;
document.getElementById("det-email").textContent = pfUser.email;
document.getElementById("det-role").textContent = pfUser.role;
document.getElementById("det-joined").textContent = pfUser.joinedDate;
document.getElementById("det-wallet").textContent = `₹${pfUser.wallet}`;
document.getElementById("det-streak").textContent = `${(pfUser.streak && pfUser.streak.count) || 0} days`;

const avatarPreview = document.getElementById("avatar-preview");
avatarPreview.src = pfUser.avatarBase64 || "data:image/svg+xml;utf8," + encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' fill='#1A2133'/><text x='50%' y='55%' font-size='30' fill='#8B93AC' text-anchor='middle'>${pfUser.username.charAt(0).toUpperCase()}</text></svg>`
);

document.getElementById("avatar-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file.", true);
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pfUser.avatarBase64 = reader.result; // Base64 data URL
    persistUser(pfUser);
    avatarPreview.src = reader.result;
    renderNavbar("profile.html");
    showToast("Profile photo updated.");
  };
  reader.readAsDataURL(file);
});

function highlightActiveTheme() {
  document.querySelectorAll("[data-theme-choice]").forEach(btn => {
    const active = btn.dataset.themeChoice === pfUser.theme;
    btn.classList.toggle("btn-primary", active);
    btn.classList.toggle("btn-ghost", !active);
  });
}
highlightActiveTheme();

document.querySelectorAll("[data-theme-choice]").forEach(btn => {
  btn.addEventListener("click", () => {
    const theme = btn.dataset.themeChoice;
    pfUser.theme = theme;
    persistUser(pfUser);
    document.documentElement.setAttribute("data-theme", theme);
    highlightActiveTheme();
    showToast(`Theme switched to ${theme}.`);
  });
});
