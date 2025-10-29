package com.cabbooking.controller;

import com.cabbooking.dto.PaymentRequest;
import com.cabbooking.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody PaymentRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = paymentService.processPayment(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{rideId}")
    public ResponseEntity<Map<String, Object>> getPaymentStatus(@PathVariable Long rideId) {
        Map<String, Object> response = paymentService.getPaymentStatus(rideId);
        return ResponseEntity.ok(response);
    }
}
