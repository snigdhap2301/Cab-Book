package com.cabbooking.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.cabbooking.dto.BookRideRequest;
import com.cabbooking.dto.ReceiptResponse;
import com.cabbooking.entity.Driver;
import com.cabbooking.entity.Payment;
import com.cabbooking.entity.Rating;
import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;
import com.cabbooking.repository.DriverRepository;
import com.cabbooking.repository.PaymentRepository;
import com.cabbooking.repository.RatingRepository;
import com.cabbooking.repository.RideRepository;
import com.cabbooking.repository.UserRepository;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private GoogleMapsService googleMapsService;

    @Autowired
    private RatingRepository ratingRepository;

    public Map<String, Object> calculateFare(BookRideRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Check if pickup and destination are the same
            if (request.getPickupLocation().trim().equalsIgnoreCase(request.getDropLocation().trim())) {
                response.put("success", false);
                response.put("message", "Pickup and destination locations cannot be the same");
                return response;
            }

            double distance = googleMapsService.calculateDistance(
                    request.getPickupLocation(),
                    request.getDropLocation()
            );

            // Check if distance is 0 or very small (less than 0.1 km)
            if (distance < 0.1) {
                response.put("success", false);
                response.put("message", "Distance between pickup and destination is too small. Minimum distance required is 0.1 km");
                return response;
            }

            double fare = googleMapsService.calculateFare(distance);
        
            // Round to 2 decimal places
            distance = Math.round(distance * 100.0) / 100.0;
            fare = Math.round(fare * 100.0) / 100.0;

            response.put("success", true);
            response.put("distance", distance);
            response.put("fare", fare);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to calculate fare");
        }

        return response;
    }

    public Map<String, Object> bookRide(BookRideRequest request, String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            User passenger = userRepository.findByEmail(userEmail).orElse(null);
            if (passenger == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            // Check if pickup and destination are the same
            if (request.getPickupLocation().trim().equalsIgnoreCase(request.getDropLocation().trim())) {
                response.put("success", false);
                response.put("message", "Pickup and destination locations cannot be the same");
                return response;
            }

            double distance = googleMapsService.calculateDistance(
                    request.getPickupLocation(),
                    request.getDropLocation()
            );

            // Check if distance is 0 or very small (less than 0.1 km)
            if (distance < 0.1) {
                response.put("success", false);
                response.put("message", "Distance between pickup and destination is too small. Minimum distance required is 0.1 km");
                return response;
            }

            double fare = googleMapsService.calculateFare(distance);
        
            // Round to 2 decimal places
            distance = Math.round(distance * 100.0) / 100.0;
            fare = Math.round(fare * 100.0) / 100.0;

            Ride ride = new Ride(
                    passenger,
                    request.getPickupLocation(),
                    request.getDropLocation(),
                    distance,
                    fare
            );

            Ride savedRide = rideRepository.save(ride);

            response.put("success", true);
            response.put("message", "Ride booked successfully");
            response.put("rideId", savedRide.getId());
            response.put("fare", fare);
            response.put("distance", distance);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to book ride");
        }

        return response;
    }

    public List<Ride> getAvailableRides() {
        return rideRepository.findByStatus(Ride.RideStatus.REQUESTED);
    }

    public List<Ride> getRidesByPassenger(String userEmail) {
        User passenger = userRepository.findByEmail(userEmail).orElse(null);
        if (passenger != null) {
            List<Ride> rides = rideRepository.findByPassengerOrderByCreatedAtDesc(passenger);
            // Ensure driver information is loaded for each ride
            rides.forEach(ride -> {
                if (ride.getDriver() != null) {
                    // Force loading of driver information
                    ride.getDriver().getName(); // This triggers lazy loading if needed
                }
            });
            return rides;
        }
        return List.of();
    }

    public List<Ride> getRidesByDriver(String userEmail) {
        try {
            User driver = userRepository.findByEmail(userEmail).orElse(null);
            if (driver != null) {
                List<Ride> rides = rideRepository.findByDriverOrderByCreatedAtDesc(driver);

                // Calculate and include rating information for each ride
                rides.forEach(ride -> {
                    try {
                        Optional<Rating> ratingOpt = ratingRepository.findByRide(ride);
                        if (ratingOpt.isPresent()) {
                            ride.setRating(ratingOpt.get().getRating().doubleValue());
                        } else {
                            ride.setRating(0.0); // No rating yet
                        }
                    } catch (Exception e) {
                        // If there's an error getting rating, set to 0
                        ride.setRating(0.0);
                    }
                });

                return rides;
            }
            return List.of();
        } catch (Exception e) {
            // Log the error and return empty list
            System.err.println("Error in getRidesByDriver: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    public Map<String, Object> acceptRide(Long rideId, String driverEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            User driver = userRepository.findByEmail(driverEmail).orElse(null);

            if (rideOpt.isEmpty() || driver == null) {
                response.put("success", false);
                response.put("message", "Ride or driver not found");
                return response;
            }

            Ride ride = rideOpt.get();
            if (ride.getStatus() != Ride.RideStatus.REQUESTED) {
                response.put("success", false);
                response.put("message", "Ride is not available");
                return response;
            }

            ride.setDriver(driver);
            ride.setStatus(Ride.RideStatus.CONFIRMED);
            rideRepository.save(ride);

            response.put("success", true);
            response.put("message", "Ride accepted successfully");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to accept ride");
        }

        return response;
    }

    public Map<String, Object> startRide(Long rideId, String driverEmail) {
        return updateRideStatus(rideId, driverEmail, Ride.RideStatus.IN_PROGRESS, "Ride started successfully");
    }

    public Map<String, Object> completeRide(Long rideId, String driverEmail) {
        return updateRideStatus(rideId, driverEmail, Ride.RideStatus.COMPLETED, "Ride completed successfully");
    }

    public Map<String, Object> cancelRide(Long rideId, String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            User user = userRepository.findByEmail(userEmail).orElse(null);

            if (rideOpt.isEmpty() || user == null) {
                response.put("success", false);
                response.put("message", "Ride or user not found");
                return response;
            }

            Ride ride = rideOpt.get();
        
            // Check if ride can be cancelled
            if (ride.getStatus() == Ride.RideStatus.COMPLETED) {
                response.put("success", false);
                response.put("message", "Cannot cancel completed ride");
                return response;
            }
        
            if (ride.getStatus() == Ride.RideStatus.CANCELLED) {
                response.put("success", false);
                response.put("message", "Ride is already cancelled");
                return response;
            }

            // Check if user is authorized to cancel (passenger or assigned driver)
            boolean isPassenger = ride.getPassenger().getId().equals(user.getId());
            boolean isDriver = ride.getDriver() != null && ride.getDriver().getId().equals(user.getId());
        
            if (!isPassenger && !isDriver) {
                response.put("success", false);
                response.put("message", "Unauthorized to cancel this ride");
                return response;
            }

            // Cancel the ride
            ride.setStatus(Ride.RideStatus.CANCELLED);
            rideRepository.save(ride);

            response.put("success", true);
            response.put("message", "Ride cancelled successfully");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to cancel ride");
        }

        return response;
    }

    private Map<String, Object> updateRideStatus(Long rideId, String driverEmail, Ride.RideStatus status, String successMessage) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<Ride> rideOpt = rideRepository.findById(rideId);
            User driver = userRepository.findByEmail(driverEmail).orElse(null);

            if (rideOpt.isEmpty() || driver == null) {
                response.put("success", false);
                response.put("message", "Ride or driver not found");
                return response;
            }

            Ride ride = rideOpt.get();
            if (!ride.getDriver().getId().equals(driver.getId())) {
                response.put("success", false);
                response.put("message", "Unauthorized to update this ride");
                return response;
            }

            ride.setStatus(status);
            rideRepository.save(ride);

            response.put("success", true);
            response.put("message", successMessage);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update ride status");
        }

        return response;
    }

    public Optional<Ride> getRideById(Long rideId) {
        return rideRepository.findById(rideId);
    }

    public ReceiptResponse getReceipt(Long rideId) {
        Optional<Ride> rideOpt = rideRepository.findById(rideId);
        if (rideOpt.isEmpty()) {
            throw new RuntimeException("Ride not found");
        }

        Ride ride = rideOpt.get();
        if (ride.getStatus() != Ride.RideStatus.COMPLETED) {
            throw new RuntimeException("Receipt only available for completed rides");
        }

        // Get payment information
        Optional<Payment> paymentOpt = paymentRepository.findByRide(ride);
        if (paymentOpt.isEmpty()) {
            throw new RuntimeException("Payment not found for this ride");
        }

        Payment payment = paymentOpt.get();

        // Get driver information
        String driverName = "N/A";
        String driverContact = "N/A";
        String vehicleNumber = "N/A";
        
        if (ride.getDriver() != null) {
            driverName = ride.getDriver().getName();
            driverContact = ride.getDriver().getPhone();
            
            Optional<Driver> driverOpt = driverRepository.findByUser(ride.getDriver());
            if (driverOpt.isPresent()) {
                vehicleNumber = driverOpt.get().getVehicleNumber();
            }
        }

        // Calculate fare breakdown - use the same calculation as booking (distance * 11)
        double totalFare = ride.getFare(); // This already contains the correct fare (distance * 11)
        double baseFare = 0.0; // No separate base fare
        double distanceFare = totalFare; // All fare is distance-based
        double taxes = 0.0; // No separate taxes
        double totalAmount = totalFare; // Total matches the booking fare

        // Generate booking reference
        String bookingReference = "CB" + String.valueOf(ride.getId()).toUpperCase() + 
                                 UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        return new ReceiptResponse(
            ride.getId(),
            bookingReference,
            ride.getCreatedAt(),
            ride.getPickupLocation(),
            ride.getDropLocation(),
            driverName,
            driverContact,
            vehicleNumber,
            ride.getDistanceKm(),
            baseFare,
            distanceFare,
            taxes,
            totalAmount, // This now matches the booking fare
            payment.getMethod().toString(),
            payment.getStatus().toString(),
            "TXN" + payment.getId() + System.currentTimeMillis(),
            payment.getCreatedAt()
        );
    }

    public Map<String, Object> toggleDriverAvailability(String driverEmail) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User driver = userRepository.findByEmail(driverEmail).orElse(null);
            if (driver == null || driver.getUserType() != User.UserType.DRIVER) {
                response.put("success", false);
                response.put("message", "Driver not found");
                return response;
            }
            
            Optional<Driver> driverOpt = driverRepository.findByUser(driver);
            if (driverOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Driver profile not found");
                return response;
            }
            
            Driver driverProfile = driverOpt.get();
            
            // Check if driver has active rides (CONFIRMED or IN_PROGRESS)
            List<Ride.RideStatus> activeStatuses = Arrays.asList(
                Ride.RideStatus.CONFIRMED, 
                Ride.RideStatus.IN_PROGRESS
            );
            List<Ride> activeRides = rideRepository.findByDriverAndStatusIn(driver, activeStatuses);
            
            if (!activeRides.isEmpty() && driverProfile.getAvailability()) {
                // Driver has active rides and is trying to go offline
                response.put("success", false);
                response.put("message", "Cannot go offline while you have active rides");
                response.put("availability", true);
                response.put("canToggle", false);
                return response;
            }
            
            // Toggle availability
            boolean newAvailability = !driverProfile.getAvailability();
            driverProfile.setAvailability(newAvailability);
            driverRepository.save(driverProfile);
            
            String message = newAvailability ? "You are now online and can receive ride requests" : 
                                             "You are now offline and won't receive new ride requests";
            
            response.put("success", true);
            response.put("message", message);
            response.put("availability", newAvailability);
            response.put("canToggle", activeRides.isEmpty());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update availability");
            response.put("availability", false);
            response.put("canToggle", true);
        }
        
        return response;
    }

    public Map<String, Object> getDriverAvailabilityStatus(String driverEmail) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User driver = userRepository.findByEmail(driverEmail).orElse(null);
            if (driver == null || driver.getUserType() != User.UserType.DRIVER) {
                response.put("success", false);
                response.put("message", "Driver not found");
                return response;
            }
            
            Optional<Driver> driverOpt = driverRepository.findByUser(driver);
            if (driverOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "Driver profile not found");
                return response;
            }
            
            Driver driverProfile = driverOpt.get();
            
            // Check if driver has active rides
            List<Ride.RideStatus> activeStatuses = Arrays.asList(
                Ride.RideStatus.CONFIRMED, 
                Ride.RideStatus.IN_PROGRESS
            );
            List<Ride> activeRides = rideRepository.findByDriverAndStatusIn(driver, activeStatuses);
            
            boolean canToggle = activeRides.isEmpty() || !driverProfile.getAvailability();
            
            response.put("success", true);
            response.put("availability", driverProfile.getAvailability());
            response.put("canToggle", canToggle);
            response.put("activeRidesCount", activeRides.size());
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get availability status");
            response.put("availability", false);
            response.put("canToggle", true);
        }
        
        return response;
    }

    public Map<String, Object> getDriverRatingStats(String driverEmail) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            User driver = userRepository.findByEmail(driverEmail).orElse(null);
            if (driver == null || driver.getUserType() != User.UserType.DRIVER) {
                response.put("success", false);
                response.put("message", "Driver not found");
                return response;
            }
            
            // Get all completed rides for this driver
            List<Ride> completedRides = rideRepository.findByDriverAndStatus(driver, Ride.RideStatus.COMPLETED);
            
            double totalRating = 0.0;
            int ratedRidesCount = 0;
            
            for (Ride ride : completedRides) {
                Optional<Rating> ratingOpt = ratingRepository.findByRide(ride);
                if (ratingOpt.isPresent()) {
                    totalRating += ratingOpt.get().getRating();
                    ratedRidesCount++;
                }
            }
            
            double averageRating = ratedRidesCount > 0 ? totalRating / ratedRidesCount : 0.0;
            
            response.put("success", true);
            response.put("totalCompletedRides", completedRides.size());
            response.put("totalRatedRides", ratedRidesCount);
            response.put("averageRating", Math.round(averageRating * 100.0) / 100.0);
            
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get rating stats");
            response.put("averageRating", 0.0);
        }
        
        return response;
    }
}
