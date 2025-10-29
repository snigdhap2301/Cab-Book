const API_BASE = "http://localhost:8080/api"

// Show login form
function showLogin() {
  document.getElementById("login-form").style.display = "block"
  document.getElementById("register-form").style.display = "none"
}

// Show register form
function showRegister() {
  document.getElementById("login-form").style.display = "none"
  document.getElementById("register-form").style.display = "block"
}

// Toggle driver fields based on user type selection
function toggleDriverFields() {
  const userType = document.getElementById("userType").value
  const driverFields = document.getElementById("driver-fields")
  const vehicleNumber = document.getElementById("vehicleNumber")
  const licenseNumber = document.getElementById("licenseNumber")

  if (userType === "DRIVER") {
    driverFields.style.display = "block"
    vehicleNumber.required = true
    licenseNumber.required = true
  } else {
    driverFields.style.display = "none"
    vehicleNumber.required = false
    licenseNumber.required = false
  }
}

// Show message to user
function showMessage(message, isError = false) {
  const messageDiv = document.getElementById("message")
  messageDiv.textContent = message
  messageDiv.className = isError ? "message error" : "message success"
  messageDiv.style.display = "block"

  setTimeout(() => {
    messageDiv.style.display = "none"
  }, 5000)
}

function handleRegistration(e) {
  console.log("handleRegistration called")
  if (e) e.preventDefault()

  const formData = {
    name: document.getElementById("registerName").value,
    email: document.getElementById("registerEmail").value,
    password: document.getElementById("registerPassword").value,
    phone: document.getElementById("registerPhone").value,
    userType: document.getElementById("userType").value,
  }

  console.log("Registration attempt:", { ...formData, password: formData.password ? "*****" : "empty" })

  // Validate required fields
  if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.userType) {
    showMessage("Please fill in all required fields", true)
    return false
  }

  // Validate password length
  if (formData.password.length < 6) {
    showMessage("Password must be at least 6 characters long", true)
    return false
  }

  // Add driver specific fields if user type is DRIVER
  if (formData.userType === "DRIVER") {
    formData.vehicleNumber = document.getElementById("vehicleNumber").value
    formData.licenseNumber = document.getElementById("licenseNumber").value

    if (!formData.vehicleNumber || !formData.licenseNumber) {
      showMessage("Please fill in vehicle and license number for drivers", true)
      return false
    }
  }

  fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showMessage("Registration successful! Please login.")
        showLogin()
        document.getElementById("registerForm").reset()
        document.getElementById("driver-fields").style.display = "none"
      } else {
        showMessage(data.message || "Registration failed", true)
      }
    })
    .catch((error) => {
      console.error("Registration error:", error)
      if (error.message.includes("Failed to fetch")) {
        showMessage("Cannot connect to server. Please ensure backend is running on http://localhost:8080", true)
      } else {
        showMessage("Network error: " + error.message, true)
      }
    })
}

// Add real-time password validation
function addPasswordValidation() {
  const passwordInput = document.getElementById("registerPassword")

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value
      const validationMessage = document.getElementById("passwordValidation")

      // Remove existing validation message
      if (validationMessage) {
        validationMessage.remove()
      }

      // Add validation message
      const messageDiv = document.createElement("div")
      messageDiv.id = "passwordValidation"
      messageDiv.style.fontSize = "14px"
      messageDiv.style.marginTop = "5px"

      if (password.length === 0) {
        messageDiv.style.color = "#6c757d"
        messageDiv.textContent = "Password must be at least 6 characters long"
      } else if (password.length < 6) {
        messageDiv.style.color = "#dc3545"
        messageDiv.textContent = `Password too short (${password.length}/6 characters minimum)`
      } else {
        messageDiv.style.color = "#28a745"
        messageDiv.textContent = "✓ Password length is valid"
      }

      this.parentNode.appendChild(messageDiv)
    })
  }
}

// Initialize event listeners when DOM is ready
function initializeEventListeners() {
  console.log("Initializing event listeners")

  // Handle login form submission
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    console.log("Login form found, adding event listener")
    loginForm.addEventListener("submit", handleLogin)
    // Also add onclick to button as backup
    const loginButton = document.getElementById("loginButton")
    if (loginButton) {
      loginButton.onclick = (e) => {
        e.preventDefault()
        handleLogin(e)
      }
    }
  } else {
    console.error("Login form not found")
  }

  // Handle registration form submission
  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    console.log("Register form found, adding event listener")
    registerForm.addEventListener("submit", handleRegistration)
    // Also add onclick to button as backup
    const registerButton = document.getElementById("registerButton")
    if (registerButton) {
      registerButton.onclick = (e) => {
        e.preventDefault()
        handleRegistration(e)
      }
    }
  } else {
    console.error("Register form not found")
  }

  // Add password validation
  addPasswordValidation()

  // Check if user is already logged in
  checkExistingLogin()
}

// Multiple ways to ensure event listeners are set up
document.addEventListener("DOMContentLoaded", initializeEventListeners)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeEventListeners)
} else {
  initializeEventListeners()
}
window.addEventListener("load", initializeEventListeners)

function handleLogin(e) {
  console.log("handleLogin called")
  if (e) e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  console.log("Login attempt:", { email, password: password ? "*****" : "empty" })

  if (!email || !password) {
    showMessage("Please fill in all fields", true)
    return false
  }

  showMessage("Attempting to login...")
  console.log("Making API call to:", `${API_BASE}/login`)

  fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Store user data in localStorage
        localStorage.setItem("token", data.token)
        localStorage.setItem("userType", data.userType)
        localStorage.setItem("userName", data.name)
        localStorage.setItem("userId", data.userId)

        // Redirect to appropriate dashboard
        if (data.userType === "PASSENGER") {
          window.location.href = "user-dashboard.html"
        } else {
          window.location.href = "driver-dashboard.html"
        }
      } else {
        showMessage(data.message || "Login failed", true)
      }
    })
    .catch((error) => {
      console.error("Login error:", error)
      if (error.message.includes("Failed to fetch")) {
        showMessage("Cannot connect to server. Please ensure backend is running on http://localhost:8080", true)
      } else {
        showMessage("Network error: " + error.message, true)
      }
    })
}

// Check if user is already logged in
function checkExistingLogin() {
  const token = localStorage.getItem("token")
  const userType = localStorage.getItem("userType")

  if (token && userType) {
    if (userType === "PASSENGER") {
      window.location.href = "user-dashboard.html"
    } else {
      window.location.href = "driver-dashboard.html"
    }
  }
}
