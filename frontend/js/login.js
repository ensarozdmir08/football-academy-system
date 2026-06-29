const form = document.getElementById("loginForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  message.textContent = "";
  message.style.color = "#ef4444";
  message.style.marginTop = "15px";
  message.style.fontWeight = "bold";

  try {
    const response = await fetch("http://localhost:5001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      message.textContent = data.message || "Invalid username or password.";
      return;
    }

    if (!data.user || !data.user.role) {
      message.textContent = "Login successful, but user role was not found.";
      return;
    }

    localStorage.setItem("user", JSON.stringify(data.user));

    if (data.user.role === "coach") {
      window.location.href = "coach-dashboard.html";
    } else if (data.user.role === "parent") {
      window.location.href = "parent-dashboard.html";
    } else {
      message.textContent = "Unknown user role.";
    }
  } catch (error) {
    console.error("Login error:", error);
    message.textContent = "Server connection error. Please check if backend is running.";
  }
});