package com.cabbooking.service;

import com.cabbooking.dto.PaymentRequest;
import com.cabbooking.entity.Payment;
import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;
import com.cabbooking.repository.PaymentRepository;
import com.cabbooking.repository.RideRepository;
import com.cabbooking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> processPayment(PaymentRequest request, String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            Optional<Ride> rideOpt = rideRepository.findById(request.getRideId());

            if (user == null || rideOpt.isEmpty()) {
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

            // Check if payment already exists
            Optional<Payment> existingPayment = paymentRepository.findByRide(ride);
            if (existingPayment.isPresent() && existingPayment.get().getStatus() == Payment.PaymentStatus.PAID) {
                response.put("success", false);
                response.put("message", "Payment already completed");
                return response;
            }

            Payment payment;
            if (existingPayment.isPresent()) {
                payment = existingPayment.get();
                payment.setMethod(request.getMethod());
            } else {
                payment = new Payment(ride, user, request.getMethod(), ride.getFare());
            }

            // Simulate payment processing (in real app, integrate with payment gateway)
            payment.setStatus(Payment.PaymentStatus.PAID);
            paymentRepository.save(payment);

            response.put("success", true);
            response.put("message", "Payment processed successfully");
            response.put("paymentId", payment.getId());
            response.put("amount", payment.getAmount());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Payment processing failed");
        }

        return response;
    }

    public Optional<Payment> getPaymentByRide(Long rideId) {
        Optional<Ride> rideOpt = rideRepository.findById(rideId);
        if (rideOpt.isPresent()) {
            return paymentRepository.findByRide(rideOpt.get());
        }
        return Optional.empty();
    }

    public Map<String, Object> getPaymentStatus(Long rideId) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Payment> paymentOpt = getPaymentByRide(rideId);
            
            if (paymentOpt.isPresent()) {
                Payment payment = paymentOpt.get();
                response.put("success", true);
                response.put("payment", payment);
                response.put("isPaid", payment.getStatus() == Payment.PaymentStatus.PAID);
            } else {
                response.put("success", false);
                response.put("payment", null);
                response.put("isPaid", false);
                response.put("message", "No payment found for this ride");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("payment", null);
            response.put("isPaid", false);
            response.put("message", "Error checking payment status");
        }
        
        return response;
    }
}
