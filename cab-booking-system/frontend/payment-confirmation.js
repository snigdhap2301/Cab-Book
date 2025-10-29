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

// Load payment confirmation data
window.addEventListener("load", async () => {
  const userName = localStorage.getItem("userName")
  document.getElementById("userName").textContent = `Welcome, ${userName}`

  // Get ride ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const rideId = urlParams.get("rideId")
  const paymentId = urlParams.get("paymentId")

  // If no ride ID is provided, just show success message and allow user to go back
  if (!rideId) {
    console.log("No ride ID provided, showing generic success message")
    return
  }

  // Optional: Try to load ride data but don't show error if it fails
  try {
    await loadPaymentConfirmationData(rideId, paymentId)
  } catch (error) {
    console.log("Could not load ride data, but payment was successful:", error)
    // Don't show error to user since payment was successful
  }
})

async function loadPaymentConfirmationData(rideId, paymentId) {
  try {
    // Load ride data with a timeout to avoid hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const rideResponse = await fetch(`${API_BASE}/ride/my-rides`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!rideResponse.ok) {
      throw new Error(`HTTP error! status: ${rideResponse.status}`)
    }

    const rides = await rideResponse.json()
    const ride = rides.find((r) => r.id == rideId)

    if (!ride) {
      console.log(`Ride ${rideId} not found in user's rides`)
      return // Don't throw error, just return
    }

    console.log("Ride data loaded successfully:", ride)

    // Try to load payment status
    try {
      const paymentResponse = await fetch(`${API_BASE}/payment/status/${rideId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json()
        console.log("Payment data loaded:", paymentData)
      }
    } catch (paymentError) {
      console.log("Could not load payment status:", paymentError)
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("Request timed out")
    } else {
      console.log("Error loading payment confirmation data:", error)
    }
    // Don't throw the error, just log it
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
