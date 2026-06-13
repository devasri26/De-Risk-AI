// Toast helper function
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px) scale(0.95)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect to dashboard
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "/dashboard";
    return;
  }

  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  // Login Form Submission
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const submitBtn = document.getElementById("submit-btn");

      if (!email || !password) {
        showToast("Please enter both email and password.", "error");
        return;
      }

      // Add loading state
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        showToast("Login successful! Redirecting...", "success");
        
        // Save auth data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } catch (err) {
        showToast(err.message, "error");
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }

  // Signup Form Submission
  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirm-password").value;
      const submitBtn = document.getElementById("submit-btn");

      if (!email || !password || !confirmPassword) {
        showToast("Please fill in all fields.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showToast("Passwords do not match.", "error");
        return;
      }

      if (password.length < 6) {
        showToast("Password must be at least 6 characters long.", "error");
        return;
      }

      // Add loading state
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Signup failed");
        }

        showToast("Account created successfully! Redirecting to login...", "success");

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (err) {
        showToast(err.message, "error");
        submitBtn.classList.remove("loading");
        submitBtn.disabled = false;
      }
    });
  }
});
