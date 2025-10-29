const API_BASE = "http://localhost:8080/api"

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

// Load user information
window.addEventListener("load", () => {
  const userName = localStorage.getItem("userName")
  document.getElementById("userName").textContent = `Welcome, ${userName}`

  setupPasswordValidation()
  setupFormHandling()
})

function setupPasswordValidation() {
  const newPasswordInput = document.getElementById("newPassword")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  // Real-time validation for new password
  newPasswordInput.addEventListener("input", function () {
    const password = this.value
    validatePasswordStrength(password)
  })

  // Real-time validation for password confirmation
  confirmPasswordInput.addEventListener("input", function () {
    const newPassword = newPasswordInput.value
    const confirmPassword = this.value
    validatePasswordMatch(newPassword, confirmPassword)
  })
}

function validatePasswordStrength(password) {
  const validationMessage = document.getElementById("newPasswordValidation")

  // Remove existing validation message
  if (validationMessage) {
    validationMessage.remove()
  }

  // Add validation message
  const messageDiv = document.createElement("div")
  messageDiv.id = "newPasswordValidation"
  messageDiv.className = "validation-message"

  if (password.length === 0) {
    messageDiv.className += " info"
    messageDiv.textContent = "Enter your new password (minimum 6 characters)"
  } else if (password.length < 6) {
    messageDiv.className += " error"
    messageDiv.textContent = `Password too short (${password.length}/6 characters minimum)`
  } else {
    messageDiv.className += " success"
    messageDiv.textContent = "✓ Password length is valid"
  }

  document.getElementById("newPassword").parentNode.appendChild(messageDiv)
}

function validatePasswordMatch(newPassword, confirmPassword) {
  const validationMessage = document.getElementById("confirmPasswordValidation")

  // Remove existing validation message
  if (validationMessage) {
    validationMessage.remove()
  }

  if (confirmPassword.length === 0) return

  // Add validation message
  const messageDiv = document.createElement("div")
  messageDiv.id = "confirmPasswordValidation"
  messageDiv.className = "validation-message"

  if (newPassword !== confirmPassword) {
    messageDiv.className += " error"
    messageDiv.textContent = "✗ Passwords do not match"
  } else {
    messageDiv.className += " success"
    messageDiv.textContent = "✓ Passwords match"
  }

  document.getElementById("confirmPassword").parentNode.appendChild(messageDiv)
}

function setupFormHandling() {
  const form = document.getElementById("changePasswordForm")
  form.addEventListener("submit", handlePasswordChange)
}

async function handlePasswordChange(e) {
  e.preventDefault()

  const currentPassword = document.getElementById("currentPassword").value
  const newPassword = document.getElementById("newPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value

  // Client-side validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    showMessage("Please fill in all fields", true)
    return
  }

  if (newPassword.length < 6) {
    showMessage("New password must be at least 6 characters long", true)
    return
  }

  if (newPassword !== confirmPassword) {
    showMessage("New passwords do not match", true)
    return
  }

  if (currentPassword === newPassword) {
    showMessage("New password must be different from current password", true)
    return
  }

  try {
    const response = await fetch(`${API_BASE}/user/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage("Password changed successfully!")
      document.getElementById("changePasswordForm").reset()

      // Clear validation messages
      const validationMessages = document.querySelectorAll(".validation-message")
      validationMessages.forEach((msg) => msg.remove())

      // Redirect to dashboard after successful change
      setTimeout(() => {
        goToDashboard()
      }, 2000)
    } else {
      showMessage(data.message || "Failed to change password", true)
    }
  } catch (error) {
    console.error("Error changing password:", error)
    showMessage("Network error. Please try again.", true)
  }
}

function goToDashboard() {
  const userType = localStorage.getItem("userType")
  if (userType === "PASSENGER") {
    window.location.href = "user-dashboard.html"
  } else {
    window.location.href = "driver-dashboard.html"
  }
}
