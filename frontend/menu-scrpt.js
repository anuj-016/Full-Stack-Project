// menu-script.js

// Get user info from localStorage
const userName = localStorage.getItem("name");  // match login.js
const token = localStorage.getItem("token");


// If not logged in, redirect to login
if (!token) {
  window.location.href = "/";
}

// Show welcome message
document.getElementById("welcome").innerText = userName ? `Hi ${userName}` : "";

// Logout button
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userName");
  window.location.href = "/";
});

// Fetch menu from API
fetch("/api/menu", {
  headers: { Authorization: `Bearer ${token}` }
})
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch menu");
    return res.json();
  })
  .then(data => {
    const menuDiv = document.getElementById("menu");
    if (!Array.isArray(data) || data.length === 0) {
      menuDiv.innerHTML = "<p>No items found.</p>";
      return;
    }
    data.forEach(item => {
      const el = document.createElement("div");
      el.className = "card menu-item";
      el.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.description || item.restaurant || ""}</p>
        <p>₹ ${item.price}</p>
      `;
      menuDiv.appendChild(el);
    });
  })
  .catch(err => {
    document.getElementById("menu").innerText = "⚠️ Error loading menu";
    console.error(err);
  });
