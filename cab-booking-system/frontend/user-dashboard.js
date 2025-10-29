const USER_API_BASE = "http://localhost:8080/api"
let currentRideId = null

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

  // Always refresh data when switching tabs to ensure latest payment status
  if (tabName === "my-rides") {
    loadMyRides()
  } else if (tabName === "ride-history") {
    loadRideHistory()
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
  loadMyRides()
  // Pre-load ride history for faster switching
  loadRideHistory()
})

// Load user rides
async function loadMyRides(forceRefresh = false) {
  try {
    // Add cache-busting parameter for force refresh
    const timestamp = forceRefresh ? `?t=${Date.now()}` : ""
    const response = await fetch(`${USER_API_BASE}/ride/my-rides${timestamp}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Cache-Control": forceRefresh ? "no-cache" : "default",
      },
    })

    const rides = await response.json()
    const myRidesDiv = document.getElementById("myRides")
    myRidesDiv.innerHTML = ""

    if (rides.length === 0) {
      myRidesDiv.innerHTML = "<p>No rides found</p>"
    } else {
      // Fetch payment and rating status for all rides
      const ridesWithStatus = await Promise.all(
        rides.map(async (ride) => {
          const paymentStatus = await getPaymentStatus(ride.id)
          const ratingStatus = await getRatingStatus(ride.id)
          return { ...ride, paymentStatus, ratingStatus }
        }),
      )

      ridesWithStatus.forEach((ride) => {
        const rideCard = document.createElement("div")
        rideCard.className = "ride-card"

        let actionButtons = ""
        let driverInfo = ""

        // Show driver information if available
        if (ride.driver && ride.driver.name) {
          driverInfo = `<p><strong>Driver:</strong> ${ride.driver.name}</p>`
        }

        // Add cancel button for rides that can be cancelled
        if (ride.status === "REQUESTED" || ride.status === "CONFIRMED") {
          actionButtons += `<button class="cancel-btn" onclick="cancelRide(${ride.id})">Cancel Ride</button>`
        }

        // Add payment and rating buttons for completed rides
        if (ride.status === "COMPLETED") {
          if (!ride.paymentStatus.isPaid) {
            actionButtons += `<button class="pay-btn pay-now-btn" onclick="payNow(${ride.id}, ${ride.fare.toFixed(2)})">Pay Now</button>`
          } else {
            actionButtons += `<button class="paid-btn pay-now-btn" disabled>✅ Paid</button>`

            if (!ride.ratingStatus.isRated) {
              actionButtons += `<button class="rate-btn" onclick="showRatingModal(${ride.id})">⭐ Rate Driver</button>`
            } else {
              actionButtons += '<span class="rated-label">⭐ Rated</span>'
            }
          }
        }

        rideCard.innerHTML = `
    <h4>Ride ID: ${ride.id}</h4>
    <div class="ride-details">
        <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
        <p><strong>Drop:</strong> ${ride.dropLocation}</p>
        ${driverInfo}
        <p><strong>Distance:</strong> ${ride.distanceKm.toFixed(2)} km</p>
        <p><strong>Fare:</strong> ₹${ride.fare.toFixed(2)}</p>
        <p><strong>Status:</strong> <span class="ride-status status-${ride.status.toLowerCase()}">${ride.status.replace("_", " ")}</span></p>
        ${ride.paymentStatus.isPaid ? '<p><strong>Payment:</strong> <span class="payment-status paid">✅ Paid</span></p>' : ""}
    </div>
    <div class="action-buttons">
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

// Calculate fare with validation
async function calculateFare() {
  const pickupLocation = document.getElementById("pickupLocation").value.trim()
  const dropLocation = document.getElementById("dropLocation").value.trim()

  if (!pickupLocation || !dropLocation) {
    showMessage("Please enter both pickup and drop locations.", true)
    return
  }

  // Frontend validation for same locations
  if (pickupLocation.toLowerCase() === dropLocation.toLowerCase()) {
    showMessage("Pickup and destination locations cannot be the same.", true)
    return
  }

  try {
    const response = await fetch(`${USER_API_BASE}/ride/calculate-fare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ pickupLocation, dropLocation }),
    })

    const data = await response.json()

    if (data.success) {
      document.getElementById("fareResult").style.display = "block"
      document.getElementById("distance").textContent = data.distance
      document.getElementById("fare").textContent = data.fare
    } else {
      showMessage(data.message || "Failed to calculate fare.", true)
      document.getElementById("fareResult").style.display = "none"
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Book ride with validation
async function bookRide() {
  const pickupLocation = document.getElementById("pickupLocation").value.trim()
  const dropLocation = document.getElementById("dropLocation").value.trim()

  // Frontend validation for same locations
  if (pickupLocation.toLowerCase() === dropLocation.toLowerCase()) {
    showMessage("Pickup and destination locations cannot be the same.", true)
    return
  }

  try {
    const response = await fetch(`${USER_API_BASE}/ride/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ pickupLocation, dropLocation }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride booked successfully.")
      loadMyRides()
      document.getElementById("fareResult").style.display = "none"
      document.getElementById("bookRideForm").reset()
    } else {
      showMessage(data.message || "Failed to book ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Show payment modal
function payNow(rideId, amount) {
  currentRideId = rideId
  document.getElementById("paymentModal").style.display = "block"

  // Add event listeners to payment methods
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
  paymentMethods.forEach((method) => {
    method.addEventListener("change", function () {
      if (this.checked) {
        // Update visual feedback when payment method is selected
        document.querySelectorAll(".payment-method").forEach((pm) => {
          pm.classList.remove("selected")
        })
        this.closest(".payment-method").classList.add("selected")
      }
    })
  })
}

// Close payment modal
function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none"
  currentRideId = null

  // Reset payment button state
  const payNowButton = document.getElementById("payNowButton")
  payNowButton.textContent = "Pay Now"
  payNowButton.disabled = false
  payNowButton.classList.remove("paid-btn")

  // Clear payment method selection
  const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]')
  paymentMethods.forEach((method) => (method.checked = false))

  // Remove selected class from payment methods
  document.querySelectorAll(".payment-method").forEach((pm) => {
    pm.classList.remove("selected")
  })
}

// Process payment
async function processPayment() {
  const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked')
  const payNowButton = document.getElementById("payNowButton")

  if (!selectedMethod) {
    showMessage("Please select a payment method", true)
    return
  }

  if (!currentRideId) {
    showMessage("No ride selected for payment", true)
    return
  }

  // Change button to show processing
  payNowButton.textContent = "Processing..."
  payNowButton.disabled = true

  try {
    const response = await fetch(`${USER_API_BASE}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        rideId: currentRideId,
        method: selectedMethod.value,
      }),
    })

    const data = await response.json()

    if (data.success) {
      // Change button to show paid status
      payNowButton.textContent = "✅ Paid"
      payNowButton.classList.add("paid-btn")
      payNowButton.disabled = true

      showMessage(data.message || "Payment successful.")

      // Refresh ride data before redirecting
      await loadMyRides(true)

      // Close modal and redirect to payment confirmation page
      setTimeout(() => {
        closePaymentModal()
        // Pass additional data in URL to avoid dependency on API calls
        window.location.href = `payment-confirmation.html?rideId=${currentRideId}&paymentId=${data.paymentId}&success=true`
      }, 1000)
    } else {
      // Reset button on failure
      payNowButton.textContent = "Pay Now"
      payNowButton.disabled = false
      showMessage(data.message || "Payment failed.", true)
    }
  } catch (error) {
    // Reset button on error
    payNowButton.textContent = "Pay Now"
    payNowButton.disabled = false
    showMessage("Network error. Please try again.", true)
  }
}

// Get payment status for a ride
async function getPaymentStatus(rideId) {
  try {
    const response = await fetch(`${USER_API_BASE}/payment/status/${rideId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`Payment response for ride ${rideId}:`, data)

      // Use the isPaid field from backend response
      const isPaid = data.isPaid === true

      console.log(`Payment status for ride ${rideId}:`, { isPaid, paymentData: data.payment })
      return { isPaid, paymentData: data.payment }
    }
    console.log(`Payment status check failed for ride ${rideId}:`, response.status)
    return { isPaid: false, paymentData: null }
  } catch (error) {
    console.error("Error fetching payment status:", error)
    return { isPaid: false, paymentData: null }
  }
}

// Get rating status for a ride
async function getRatingStatus(rideId) {
  try {
    const response = await fetch(`${USER_API_BASE}/rating/ride/${rideId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return { isRated: data.success && data.rating !== null, ratingData: data.rating }
    }
    return { isRated: false, ratingData: null }
  } catch (error) {
    console.error("Error fetching rating status:", error)
    return { isRated: false, ratingData: null }
  }
}

let currentRatingRideId = null
let currentRatingData = null

// Enhanced rating modal - redirect to dedicated page
async function showRatingModal(rideId) {
  window.location.href = `rating-submission.html?rideId=${rideId}`
}

function closeRatingModal() {
  document.getElementById("ratingModal").style.display = "none"
  currentRatingRideId = null
  currentRatingData = null
  resetStarRating()
}

function setupStarRating() {
  const stars = document.querySelectorAll(".star")

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
  document.getElementById("starRating").addEventListener("mouseleave", () => {
    if (currentRatingData) {
      highlightStars(currentRatingData.rating)
    } else {
      resetStarRating()
    }
  })
}

function setStarRating(rating) {
  currentRatingData = { rating }
  highlightStars(rating)
}

function highlightStars(rating) {
  const stars = document.querySelectorAll(".star")
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add("active")
    } else {
      star.classList.remove("active")
    }
  })
}

function resetStarRating() {
  const stars = document.querySelectorAll(".star")
  stars.forEach((star) => {
    star.classList.remove("active")
  })
}

// Submit rating from modal
async function submitRatingFromModal() {
  if (!currentRatingData || !currentRatingData.rating) {
    showMessage("Please select a rating", true)
    return
  }

  const comment = document.getElementById("ratingComment").value.trim()
  const submitButton = document.getElementById("submitRatingButton")

  // Show loading state
  submitButton.textContent = "Submitting..."
  submitButton.disabled = true

  try {
    const response = await fetch(`${USER_API_BASE}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        rideId: currentRatingRideId,
        rating: currentRatingData.rating,
        comments: comment,
      }),
    })

    const data = await response.json()

    if (data.success) {
      showMessage("⭐ Thank you for your rating!")
      closeRatingModal()
      loadMyRides(true)
      loadRideHistory(true)
    } else {
      showMessage(data.message || "Failed to submit rating.", true)
    }
  } catch (error) {
    console.error("Error submitting rating:", error)
    showMessage("Network error. Please try again.", true)
  } finally {
    // Reset button state
    submitButton.textContent = "Submit Rating"
    submitButton.disabled = false
  }
}

// Cancel ride function
async function cancelRide(rideId) {
  if (!confirm("Are you sure you want to cancel this ride?")) {
    return
  }

  try {
    const response = await fetch(`${USER_API_BASE}/ride/cancel/${rideId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    const data = await response.json()

    if (data.success) {
      showMessage(data.message || "Ride cancelled successfully.")
      loadMyRides(true)
      loadRideHistory(true)
    } else {
      showMessage(data.message || "Failed to cancel ride.", true)
    }
  } catch (error) {
    showMessage("Network error. Please try again.", true)
  }
}

// Load ride history
async function loadRideHistory(forceRefresh = false) {
  try {
    // Add cache-busting parameter for force refresh
    const timestamp = forceRefresh ? `?t=${Date.now()}` : ""
    const response = await fetch(`${USER_API_BASE}/ride/my-rides${timestamp}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Cache-Control": forceRefresh ? "no-cache" : "default",
      },
    })

    const rides = await response.json()
    const rideHistoryDiv = document.getElementById("rideHistoryContainer")
    rideHistoryDiv.innerHTML = ""

    const completedRides = rides.filter((ride) => ride.status === "COMPLETED")

    if (completedRides.length === 0) {
      rideHistoryDiv.innerHTML = "<p>No completed rides found</p>"
    } else {
      // Fetch payment status for completed rides
      const ridesWithPayment = await Promise.all(
        completedRides.map(async (ride) => {
          const paymentStatus = await getPaymentStatus(ride.id)
          return { ...ride, paymentStatus }
        }),
      )

      ridesWithPayment.forEach((ride) => {
        const rideCard = document.createElement("div")
        rideCard.className = "ride-card"

        // For ride history, show receipt button for completed rides with payment
        let receiptButton = ""
        let payButton = ""

        if (ride.paymentStatus.isPaid) {
          // Ride is completed and paid - show receipt download button
          receiptButton = `<button class="receipt-btn" onclick="downloadComprehensiveReceipt(${ride.id})">📄 Download Receipt</button>`
        } else {
          // Ride is completed but not paid - show pay button and disabled receipt
          payButton = `<button class="pay-btn pay-now-btn" onclick="payNow(${ride.id}, ${ride.fare.toFixed(2)})">Pay Now</button>`
          receiptButton = '<span class="receipt-unavailable">📄 Receipt available after payment</span>'
        }

        rideCard.innerHTML = `
                    <h4>Ride ID: ${ride.id}</h4>
                    <div class="ride-details">
                        <p><strong>Date & Time:</strong> ${new Date(ride.createdAt).toLocaleString()}</p>
                        <p><strong>Pickup:</strong> ${ride.pickupLocation}</p>
                        <p><strong>Drop:</strong> ${ride.dropLocation}</p>
                        <p><strong>Distance:</strong> ${ride.distanceKm.toFixed(2)} km</p>
                        <p><strong>Fare:</strong> ₹${ride.fare.toFixed(2)}</p>
                        <p><strong>Payment Status:</strong> 
                            <span class="payment-status ${ride.paymentStatus.isPaid ? "paid" : "pending"}">
                                ${ride.paymentStatus.isPaid ? "✅ Paid" : "⏳ Pending"}
                            </span>
                        </p>
                    </div>
                    <div class="action-buttons">
                        ${payButton}
                        ${receiptButton}
                    </div>
                `
        rideHistoryDiv.appendChild(rideCard)
      })
    }
  } catch (error) {
    showMessage("Failed to load ride history. Please try again.", true)
  }
}

// Download comprehensive receipt using new API
async function downloadComprehensiveReceipt(rideId) {
  try {
    showMessage("Generating receipt...", false)

    // Get comprehensive receipt data from backend
    const response = await fetch(`${USER_API_BASE}/ride/receipt/${rideId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch receipt data")
    }

    const receipt = await response.json()

    // Format comprehensive receipt
    const receiptText = `
═══════════════════════════════════════════════════════════
                        RIDESYNC
                      RIDE RECEIPT
═══════════════════════════════════════════════════════════

BOOKING DETAILS:
---------------
Ride ID:                 ${receipt.rideId}
Booking Reference:       ${receipt.bookingReference}
Ride Date & Time:        ${new Date(receipt.rideDateTime).toLocaleString()}

TRIP INFORMATION:
-----------------
Pickup Location:         ${receipt.pickupLocation}
Drop Location:           ${receipt.dropLocation}
Distance Traveled:       ${receipt.distanceKm.toFixed(2)} km

DRIVER DETAILS:
---------------
Driver Name:             ${receipt.driverName}
Driver Contact:          ${receipt.driverContact}
Vehicle Number:          ${receipt.vehicleNumber}

FARE BREAKDOWN:
---------------
Base Fare:               ₹${receipt.baseFare.toFixed(2)}
Distance Fare:           ₹${receipt.distanceFare.toFixed(2)}
Taxes (GST):             ₹${receipt.taxes.toFixed(2)}
                         ----------------
Total Amount Paid:       ₹${receipt.totalAmount.toFixed(2)}

PAYMENT INFORMATION:
--------------------
Payment Method:          ${receipt.paymentMethod}
Payment Status:          ${receipt.paymentStatus}
Transaction ID:          ${receipt.transactionId}
Payment Date & Time:     ${new Date(receipt.paymentDateTime).toLocaleString()}

═══════════════════════════════════════════════════════════
              Thank you for choosing our service!
                   Have a great day ahead!
═══════════════════════════════════════════════════════════

This is a computer-generated receipt.
`

    // Create and download the file
    const blob = new Blob([receiptText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `RideSync-Receipt-${receipt.rideId}-${receipt.bookingReference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showMessage(" receipt downloaded successfully!")
  } catch (error) {
    console.error("Error downloading receipt:", error)
    showMessage("Failed to download receipt. Please try again.", true)
  }
}

// Backward compatibility function
async function downloadRideReceipt(rideId) {
  return downloadComprehensiveReceipt(rideId)
}
