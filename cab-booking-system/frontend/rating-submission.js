const API_BASE = "http://localhost:8080/api"
let currentRideData = null
let selectedRating = 0

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

// Load rating submission data
window.addEventListener("load", async () => {
  const userName = localStorage.getItem("userName")
  document.getElementById("userName").textContent = `Welcome, ${userName}`

  // Get ride ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const rideId = urlParams.get("rideId")

  if (!rideId) {
    showMessage("No ride information found", true)
    setTimeout(() => {
      goToDashboard()
    }, 3000)
    return
  }

  await loadRideData(rideId)
  setupStarRating()
})

async function loadRideData(rideId) {
  try {
    // Load ride data
    const response = await fetch(`${API_BASE}/ride/my-rides`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const rides = await response.json()
    const ride = rides.find((r) => r.id == rideId)

    if (!ride) {
      showMessage("Ride not found", true)
      return
    }

    currentRideData = ride

    // Populate trip summary
    document.getElementById("pickupLocation").textContent = ride.pickupLocation
    document.getElementById("dropLocation").textContent = ride.dropLocation
    document.getElementById("tripDistance").textContent = `${ride.distanceKm.toFixed(2)} km`
    document.getElementById("tripFare").textContent = `₹${ride.fare.toFixed(2)}`
    document.getElementById("tripDate").textContent = new Date(ride.createdAt).toLocaleDateString()

    // Populate driver information
    const driverName = ride.driver?.name || "Driver"
    const driverAvatar = document.getElementById("driverAvatar")
    driverAvatar.textContent = driverName.charAt(0).toUpperCase()

    document.getElementById("driverName").textContent = driverName
    document.getElementById("driverInfo").textContent = `${ride.pickupLocation} → ${ride.dropLocation}`
  } catch (error) {
    console.error("Error loading ride data:", error)
    showMessage("Failed to load ride details", true)
  }
}

function setupStarRating() {
  const stars = document.querySelectorAll(".star-large")

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const rating = Number.parseInt(star.dataset.rating)
      setStarRating(rating)
    })

    star.addEventListener("mouseenter", () => {
      const rating = Number.parseInt(star.dataset.rating)
      highlightStars(rating)
    })
  })

  // Reset on mouse leave
  document.getElementById("starRatingLarge").addEventListener("mouseleave", () => {
    if (selectedRating > 0) {
      highlightStars(selectedRating)
    } else {
      resetStarRating()
    }
  })
}

function setStarRating(rating) {
  selectedRating = rating
  highlightStars(rating)
}

function highlightStars(rating) {
  const stars = document.querySelectorAll(".star-large")
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active")
    } else {
      star.classList.remove("active")
    }
  })
}

function resetStarRating() {
  const stars = document.querySelectorAll(".star-large")
  stars.forEach((star) => {
    star.classList.remove("active")
  })
}

async function submitRating() {
  if (selectedRating === 0) {
    showMessage("Please select a rating", true)
    return
  }

  if (!currentRideData) {
    showMessage("No ride data available", true)
    return
  }

  const comment = document.getElementById("ratingCommentLarge").value.trim()
  const submitButton = document.getElementById("submitRatingBtn")

  // Show loading state
  submitButton.textContent = "Submitting..."
  submitButton.disabled = true

  try {
    const response = await fetch(`${API_BASE}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        rideId: currentRideData.id,
        rating: selectedRating,
        comments: comment,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage("⭐ Thank you for your rating!")

      // Show success message and redirect after delay
      setTimeout(() => {
        goToDashboard()
      }, 2000)
    } else {
      showMessage(data.message || "Failed to submit rating.", true)
    }
  } catch (error) {
    console.error("Error submitting rating:", error)
    showMessage("Network error. Please try again.", true)
  } finally {
    // Reset button state
    submitButton.textContent = "⭐ Submit Rating"
    submitButton.disabled = false
  }
}

function skipRating() {
  if (confirm("Are you sure you want to skip rating? You can rate later from your ride history.")) {
    goToDashboard()
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
