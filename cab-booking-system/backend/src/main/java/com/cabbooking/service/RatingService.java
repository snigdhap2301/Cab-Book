package com.cabbooking.service;

import com.cabbooking.dto.RatingRequest;
import com.cabbooking.entity.Rating;
import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;
import com.cabbooking.repository.RatingRepository;
import com.cabbooking.repository.RideRepository;
import com.cabbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class RatingService {

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> submitRating(RatingRequest request, String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            User passenger = userRepository.findByEmail(userEmail).orElse(null);
            Optional<Ride> rideOpt = rideRepository.findById(request.getRideId());

            if (passenger == null || rideOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User or ride not found");
                return response;
            }

            Ride ride = rideOpt.get();

            // Check if ride is completed
            if (ride.getStatus() != Ride.RideStatus.COMPLETED) {
                response.put("success", false);
                response.put("message", "Ride is not completed yet");
                return response;
            }

            // Check if user is the passenger of this ride
            if (!ride.getPassenger().getId().equals(passenger.getId())) {
                response.put("success", false);
                response.put("message", "Unauthorized to rate this ride");
                return response;
            }

            // Check if rating already exists
            Optional<Rating> existingRating = ratingRepository.findByRide(ride);
            if (existingRating.isPresent()) {
                response.put("success", false);
                response.put("message", "Rating already submitted for this ride");
                return response;
            }

            // Validate rating value
            if (request.getRating() < 1 || request.getRating() > 5) {
                response.put("success", false);
                response.put("message", "Rating must be between 1 and 5");
                return response;
            }

            Rating rating = new Rating(
                    ride,
                    passenger,
                    ride.getDriver(),
                    request.getRating(),
                    request.getComments()
            );

            ratingRepository.save(rating);

            response.put("success", true);
            response.put("message", "Rating submitted successfully");
            response.put("ratingId", rating.getId());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to submit rating");
        }

        return response;
    }

    public Optional<Rating> getRatingByRide(Long rideId) {
        Optional<Ride> rideOpt = rideRepository.findById(rideId);
        if (rideOpt.isPresent()) {
            return ratingRepository.findByRide(rideOpt.get());
        }
        return Optional.empty();
    }
}
