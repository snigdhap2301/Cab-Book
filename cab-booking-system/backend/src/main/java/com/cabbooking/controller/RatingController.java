package com.cabbooking.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cabbooking.dto.RatingRequest;
import com.cabbooking.entity.Rating;
import com.cabbooking.service.RatingService;

@RestController
@RequestMapping("/rate")
@CrossOrigin(origins = "*")
public class RatingController {

    @Autowired
    private RatingService ratingService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitRating(@RequestBody RatingRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = ratingService.submitRating(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<Map<String, Object>> getRatingByRide(@PathVariable Long rideId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Rating> ratingOpt = ratingService.getRatingByRide(rideId);
            
            if (ratingOpt.isPresent()) {
                response.put("success", true);
                response.put("rating", ratingOpt.get());
            } else {
                response.put("success", false);
                response.put("rating", null);
                response.put("message", "No rating found for this ride");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("rating", null);
            response.put("message", "Error fetching rating");
        }
        
        return ResponseEntity.ok(response);
    }
}
