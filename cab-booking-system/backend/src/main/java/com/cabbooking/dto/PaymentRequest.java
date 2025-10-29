package com.cabbooking.dto;

import com.cabbooking.entity.Payment;

public class PaymentRequest {
    private Long rideId;
    private Payment.PaymentMethod method;
    
    // Constructors
    public PaymentRequest() {}
    
    public PaymentRequest(Long rideId, Payment.PaymentMethod method) {
        this.rideId = rideId;
        this.method = method;
    }
    
    // Getters and Setters
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    
    public Payment.PaymentMethod getMethod() { return method; }
    public void setMethod(Payment.PaymentMethod method) { this.method = method; }
}
