package com.cabbooking.controller;

import java.util.List;
import java.util.Map;

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

import com.cabbooking.dto.BookRideRequest;
import com.cabbooking.dto.ReceiptResponse;
import com.cabbooking.entity.Ride;
import com.cabbooking.service.RideService;

@RestController
@RequestMapping("/ride")
@CrossOrigin(origins = "*")
public class RideController {

    @Autowired
    private RideService rideService;

    @PostMapping("/calculate-fare")
    public ResponseEntity<Map<String, Object>> calculateFare(@RequestBody BookRideRequest request) {
        Map<String, Object> response = rideService.calculateFare(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/book")
    public ResponseEntity<Map<String, Object>> bookRide(@RequestBody BookRideRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.bookRide(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/requests")
    public ResponseEntity<List<Ride>> getAvailableRides() {
        List<Ride> rides = rideService.getAvailableRides();
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my-rides")
    public ResponseEntity<List<Ride>> getMyRides() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Ride> rides = rideService.getRidesByPassenger(userEmail);
        return ResponseEntity.ok(rides);
    }

    @GetMapping("/my-driver-rides")
    public ResponseEntity<List<Ride>> getMyDriverRides() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Ride> rides = rideService.getRidesByDriver(userEmail);
        return ResponseEntity.ok(rides);
    }

    @PostMapping("/accept/{rideId}")
    public ResponseEntity<Map<String, Object>> acceptRide(@PathVariable Long rideId) {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.acceptRide(rideId, driverEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/start/{rideId}")
    public ResponseEntity<Map<String, Object>> startRide(@PathVariable Long rideId) {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.startRide(rideId, driverEmail);
        return ResponseEntity.ok(response);
    }

@PostMapping("/complete/{rideId}")
    public ResponseEntity<Map<String, Object>> completeRide(@PathVariable Long rideId) {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.completeRide(rideId, driverEmail);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/cancel/{rideId}")
    public ResponseEntity<Map<String, Object>> cancelRide(@PathVariable Long rideId) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.cancelRide(rideId, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/receipt/{rideId}")
    public ResponseEntity<ReceiptResponse> getReceipt(@PathVariable Long rideId) {
        ReceiptResponse receipt = rideService.getReceipt(rideId);
        return ResponseEntity.ok(receipt);
    }

    @PostMapping("/driver/toggle-availability")
    public ResponseEntity<Map<String, Object>> toggleDriverAvailability() {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.toggleDriverAvailability(driverEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/driver/availability-status")
    public ResponseEntity<Map<String, Object>> getDriverAvailabilityStatus() {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.getDriverAvailabilityStatus(driverEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/driver/rating-stats")
    public ResponseEntity<Map<String, Object>> getDriverRatingStats() {
        String driverEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = rideService.getDriverRatingStats(driverEmail);
        return ResponseEntity.ok(response);
    }
}
