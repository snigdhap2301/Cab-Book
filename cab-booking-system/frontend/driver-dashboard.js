const DRIVER_API_BASE = "http://localhost:8080/api"

// Tab functionality
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content")
  tabContents.forEach((tab) => {
    tab.classList.remove("active")
  })

  // Remove active class from all tabs
  const tabs = document.querySelectorAll(".nav-tab")
  tabs.forEach((tab) => {
    tab.classList.remove("active")
  })

  // Show selected tab content
  document.getElementById(tabName).classList.add("active")

  // Add active class to clicked tab
  event.target.classList.add("active")

  // Load data for the tab
  if (tabName === "ride-requests") {
    loadRideRequests()
  } else if (tabName === "my-rides") {
    loadMyRides()
  } else if (tabName === "earnings") {
    loadEarnings()
  }
}

// Logout function
function logout() {
  localStorage.clear()
  window.location.href = "index.html"
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

// Load user information
window.addEventListener("load", () => {
  const userName = localStorage.getItem("userName")
  document.getElementById("userName").textContent = `Welcome, ${userName}`
  loadDriverAvailabilityStatus()
  loadRideRequests()
  loadMyRides()
})

// Driver availability toggle functionality
async function loadDriverAvailabilityStatus() {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/driver/availability-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Initial availability status:", data)

    if (data.success) {
      updateAvailabilityUI(data.availability, data.canToggle)
    } else {
      console.error("Failed to load availability status:", data.message)
      showMessage("Failed to load availability status", true)
    }
  } catch (error) {
    console.error("Error loading availability status:", error)
    showMessage("Failed to connect to server. Please check your connection.", true)
  }
}

function updateAvailabilityUI(isOnline, canToggle) {
  const toggle = document.getElementById("availabilityToggle")
  const statusBadge = document.getElementById("availabilityStatus")
  const toggleText = document.querySelector(".toggle-text")
  const availabilityMessage = document.getElementById("availabilityMessage")

  console.log("Updating UI - isOnline:", isOnline, "canToggle:", canToggle)

  // Update toggle state - temporarily remove event listener to prevent triggering
  toggle.onchange = null
  toggle.checked = isOnline
  toggle.disabled = !canToggle

  // Re-attach event listener
  setTimeout(() => {
    toggle.onchange = toggleAvailability
  }, 100)

  // Update status badge and text
  if (isOnline) {
    statusBadge.textContent = "Online"
    statusBadge.className = "status-badge online"
    toggleText.textContent = "Go Offline"
  } else {
    statusBadge.textContent = "Offline"
    statusBadge.className = "status-badge offline"
    toggleText.textContent = "Go Online"
  }

  // Show message if toggle is disabled
  if (!canToggle) {
    availabilityMessage.textContent = "Cannot change availability while you have active rides"
    availabilityMessage.className = "availability-message warning"
    availabilityMessage.style.display = "block"
    toggleText.textContent = "Active Ride"
  } else {
    availabilityMessage.style.display = "none"
  }
}

async function toggleAvailability() {
  const toggle = document.getElementById("availabilityToggle")
  const availabilityMessage = document.getElementById("availabilityMessage")

  // Get current state before making the request
  const currentlyOnline = toggle.checked

  console.log("Toggle clicked. Current state:", currentlyOnline ? "Online" : "Offline")

  // Show loading message
  availabilityMessage.textContent = "Updating availability..."
  availabilityMessage.className = "availability-message info"
  availabilityMessage.style.display = "block"

  // Disable toggle during request
  toggle.disabled = true

  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/driver/toggle-availability`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("Toggle response:", data)

    if (data.success) {
      // Update UI with the new state from server
      const newState = data.availability
      console.log("New state from server:", newState ? "Online" : "Offline")

      showMessage(data.message)
      updateAvailabilityUI(newState, data.canToggle)

      // Refresh ride requests since availability changed
      loadRideRequests()
    } else {
      showMessage(data.message || "Failed to update availability", true)
      // Revert toggle state on failure
      toggle.checked = !currentlyOnline
      console.log("Reverting to:", !currentlyOnline ? "Online" : "Offline")
    }
  } catch (error) {
    console.error("Error toggling availability:", error)
    showMessage("Network error. Please check your connection and try again.", true)
    // Revert toggle state on error
    toggle.checked = !currentlyOnline
    console.log("Reverting due to error to:", !currentlyOnline ? "Online" : "Offline")
  } finally {
    // Hide loading message and re-enable toggle
    availabilityMessage.style.display = "none"
    toggle.disabled = false
  }
}

// Load available ride requests - only show if driver is online
async function loadRideRequests() {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/requests`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const rides = await response.json()
    const rideRequestsDiv = document.getElementById("rideRequests")
    rideRequestsDiv.innerHTML = ""

    // Check if driver is online first
    const availabilityResponse = await fetch(`${DRIVER_API_BASE}/ride/driver/availability-status`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const availabilityData = await availabilityResponse.json()
    const isDriverOnline = availabilityData.success && availabilityData.availability

    if (!isDriverOnline) {
      rideRequestsDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <h3>🔴 You are currently offline</h3>
          <p>Go online to start receiving ride requests</p>
        </div>
      `
      return
    }

    if (rides.length === 0) {
      rideRequestsDiv.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
          <h3>🟢 You are online</h3>
          <p>No ride requests available at the moment</p>
          <p>New requests will appear here automatically</p>
        </div>
      `
    } else {
      rides.forEach((ride) => {
        const rideCard = document.createElement("div")
        rideCard.className = "ride-card"
        rideCard.innerHTML = `
                    <h4>Ride ID: ${ride.id}</h4>
                    <div class="ride-details">
                        <p><strong>Passenger:</strong> ${ride.passenger.name}</p>
                        <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
                        <p><strong>Drop:</strong> ${ride.dropLocation}</p>
                        <p><strong>Distance:</strong> ${ride.distanceKm.toFixed(2)} km</p>
                        <p><strong>Fare:</strong> ₹${ride.fare.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span class="ride-status status-${ride.status.toLowerCase()}">${ride.status.replace("_", " ")}</span></p>
                    </div>
                    <div class="ride-actions">
                        <button class="accept-btn" onclick="acceptRide(${ride.id})">Accept Ride</button>
                    </div>
                `
        rideRequestsDiv.appendChild(rideCard)
      })
    }
  } catch (error) {
    console.error("Error loading ride requests:", error)
    showMessage("Failed to load ride requests. Please try again.", true)
  }
}

// Load driver's rides
async function loadMyRides() {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/my-driver-rides`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const rides = await response.json()
    const myRidesDiv = document.getElementById("myRides")
    myRidesDiv.innerHTML = ""

    if (rides.length === 0) {
      myRidesDiv.innerHTML = "<p>No rides found</p>"
    } else {
      rides.forEach((ride) => {
        const rideCard = document.createElement("div")
        rideCard.className = "ride-card"

        let actionButtons = ""

        // Add appropriate action buttons based on ride status
        if (ride.status === "CONFIRMED") {
          actionButtons = `
                        <button class="start-btn" onclick="startRide(${ride.id})">Start Ride</button>
                        <button class="cancel-btn" onclick="cancelRide(${ride.id})">Cancel Ride</button>
                    `
        } else if (ride.status === "IN_PROGRESS") {
          actionButtons = `<button class="complete-btn" onclick="completeRide(${ride.id})">Complete Ride</button>`
        }

        rideCard.innerHTML = `
                    <h4>Ride ID: ${ride.id}</h4>
                    <div class="ride-details">
                        <p><strong>Passenger:</strong> ${ride.passenger.name}</p>
                        <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
                        <p><strong>Drop:</strong> ${ride.dropLocation}</p>
                        <p><strong>Distance:</strong> ${ride.distanceKm.toFixed(2)} km</p>
                        <p><strong>Fare:</strong> ₹${ride.fare.toFixed(2)}</p>
                        <p><strong>Status:</strong> <span class="ride-status status-${ride.status.toLowerCase()}">${ride.status.replace("_", " ")}</span></p>
                    </div>
                    <div class="ride-actions">
                        ${actionButtons}
                    </div>
                `
        myRidesDiv.appendChild(rideCard)
      })
    }
  } catch (error) {
    showMessage("Failed to load rides. Please try again.", true)
  }
}

// Accept a ride
async function acceptRide(rideId) {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/accept/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride accepted successfully.")
      loadRideRequests()
      loadMyRides()
      // Refresh availability status as driver now has active ride
      loadDriverAvailabilityStatus()
    } else {
      showMessage(data.message || "Failed to accept ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Start a ride
async function startRide(rideId) {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/start/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride started successfully.")
      loadMyRides()
    } else {
      showMessage(data.message || "Failed to start ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Complete a ride
async function completeRide(rideId) {
  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/complete/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride completed successfully.")
      loadMyRides()
      loadEarnings()
      // Refresh availability status as driver no longer has active ride
      loadDriverAvailabilityStatus()
    } else {
      showMessage(data.message || "Failed to complete ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Load earnings summary with real rating data and replace "Completed" with rating badge
async function loadEarnings() {
  try {
    const [ridesResponse, ratingResponse] = await Promise.all([
      fetch(`${DRIVER_API_BASE}/ride/my-driver-rides`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
      fetch(`${DRIVER_API_BASE}/ride/driver/rating-stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }),
    ])

    const rides = await ridesResponse.json()
    const ratingStats = await ratingResponse.json()
    const earningsContainer = document.getElementById("earningsContainer")
    earningsContainer.innerHTML = ""

    const completedRides = rides.filter((ride) => ride.status === "COMPLETED")
    const totalEarnings = completedRides.reduce((sum, ride) => sum + ride.fare, 0)
    const totalRides = completedRides.length

    // Use real rating data from backend
    const avgRating = ratingStats.success ? ratingStats.averageRating : 0.0

    // Create earnings summary (removed "Rated Rides" count)
    const summaryCard = document.createElement("div")
    summaryCard.className = "earnings-summary"
    summaryCard.innerHTML = `
            <div class="earnings-grid">
                <div class="earning-item">
                    <div class="earning-value">${totalRides}</div>
                    <div class="earning-label">Total Rides</div>
                </div>
                <div class="earning-item">
                    <div class="earning-value">₹${totalEarnings.toFixed(2)}</div>
                    <div class="earning-label">Total Earnings</div>
                </div>
                <div class="earning-item">
                    <div class="earning-value">${avgRating > 0 ? avgRating.toFixed(1) + "⭐" : "No ratings yet"}</div>
                    <div class="earning-label">Avg Rating</div>
                </div>
            </div>
        `
    earningsContainer.appendChild(summaryCard)

    // Show completed rides
    if (completedRides.length > 0) {
      const ridesHeader = document.createElement("h3")
      ridesHeader.textContent = "Completed Rides"
      ridesHeader.style.marginTop = "2rem"
      ridesHeader.style.marginBottom = "1rem"
      earningsContainer.appendChild(ridesHeader)

      // Fetch individual ride ratings for display
      for (const ride of completedRides) {
        const rideCard = document.createElement("div")
        rideCard.className = "ride-card"

        // Try to get rating for this specific ride - FIXED URL
        let ratingDisplay = "Not rated"
        let ratingBadgeClass = "status-not-rated"

        try {
          console.log(`Fetching rating for ride ${ride.id}`)
          const ratingResponse = await fetch(`${DRIVER_API_BASE}/rate/ride/${ride.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          })

          console.log(`Rating response status for ride ${ride.id}:`, ratingResponse.status)

          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json()
            console.log(`Rating data for ride ${ride.id}:`, ratingData)

            if (ratingData.success && ratingData.rating) {
              const rating = ratingData.rating.rating
              ratingDisplay = `${rating}⭐`

              // Set badge class based on rating value
              if (rating >= 4) {
                ratingBadgeClass = "status-excellent"
              } else if (rating >= 3) {
                ratingBadgeClass = "status-good"
              } else {
                ratingBadgeClass = "status-poor"
              }

              if (ratingData.rating.comments) {
                ratingDisplay += ` - "${ratingData.rating.comments}"`
              }

              console.log(`Rating found for ride ${ride.id}: ${rating} stars`)
            } else {
              console.log(`No rating found for ride ${ride.id}`)
            }
          } else {
            console.log(`Failed to fetch rating for ride ${ride.id}: ${ratingResponse.status}`)
          }
        } catch (error) {
          console.error(`Error fetching rating for ride ${ride.id}:`, error)
        }

        rideCard.innerHTML = `
                    <h4>Ride ID: ${ride.id}</h4>
                    <div class="ride-details">
                        <p><strong>Passenger:</strong> ${ride.passenger.name}</p>
                        <p><strong>From:</strong> ${ride.pickupLocation}</p>
                        <p><strong>To:</strong> ${ride.dropLocation}</p>
                        <p><strong>Distance:</strong> ${ride.distanceKm.toFixed(2)} km</p>
                        <p><strong>Earnings:</strong> ₹${ride.fare.toFixed(2)}</p>
                        <p><strong>Rating:</strong> ${ratingDisplay}</p>
                        <p><strong>Date:</strong> ${new Date(ride.createdAt).toLocaleDateString()}</p>
                        <span class="ride-status ${ratingBadgeClass}">${ratingDisplay.split(" - ")[0]}</span>
                    </div>
                `
        earningsContainer.appendChild(rideCard)
      }
    }
  } catch (error) {
    console.error("Error loading earnings:", error)
    showMessage("Failed to load earnings. Please try again.", true)
  }
}

// Cancel ride function for drivers
async function cancelRide(rideId) {
  if (!confirm("Are you sure you want to cancel this ride?")) {
    return
  }

  try {
    const response = await fetch(`${DRIVER_API_BASE}/ride/cancel/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride cancelled successfully.")
      loadRideRequests()
      loadMyRides()
      // Refresh availability status
      loadDriverAvailabilityStatus()
    } else {
      showMessage(data.message || "Failed to cancel ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}
