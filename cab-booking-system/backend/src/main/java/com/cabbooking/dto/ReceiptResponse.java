package com.cabbooking.dto;

import java.time.LocalDateTime;

public class ReceiptResponse {
    private Long rideId;
    private String bookingReference;
    private LocalDateTime rideDateTime;
    private String pickupLocation;
    private String dropLocation;
    private String driverName;
    private String driverContact;
    private String vehicleNumber;
    private Double distanceKm;
    private Double baseFare;
    private Double distanceFare;
    private Double taxes;
    private Double totalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String transactionId;
    private LocalDateTime paymentDateTime;
    
    // Constructors
    public ReceiptResponse() {}
    
    public ReceiptResponse(Long rideId, String bookingReference, LocalDateTime rideDateTime,
                          String pickupLocation, String dropLocation, String driverName,
                          String driverContact, String vehicleNumber, Double distanceKm,
                          Double baseFare, Double distanceFare, Double taxes, Double totalAmount,
                          String paymentMethod, String paymentStatus, String transactionId,
                          LocalDateTime paymentDateTime) {
        this.rideId = rideId;
        this.bookingReference = bookingReference;
        this.rideDateTime = rideDateTime;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.driverName = driverName;
        this.driverContact = driverContact;
        this.vehicleNumber = vehicleNumber;
        this.distanceKm = distanceKm;
        this.baseFare = baseFare;
        this.distanceFare = distanceFare;
        this.taxes = taxes;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.transactionId = transactionId;
        this.paymentDateTime = paymentDateTime;
    }
    
    // Getters and Setters
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    
    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }
    
    public LocalDateTime getRideDateTime() { return rideDateTime; }
    public void setRideDateTime(LocalDateTime rideDateTime) { this.rideDateTime = rideDateTime; }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
    
    public String getDriverName() { return driverName; }
    public void setDriverName(String driverName) { this.driverName = driverName; }
    
    public String getDriverContact() { return driverContact; }
    public void setDriverContact(String driverContact) { this.driverContact = driverContact; }
    
    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
    
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    
    public Double getBaseFare() { return baseFare; }
    public void setBaseFare(Double baseFare) { this.baseFare = baseFare; }
    
    public Double getDistanceFare() { return distanceFare; }
    public void setDistanceFare(Double distanceFare) { this.distanceFare = distanceFare; }
    
    public Double getTaxes() { return taxes; }
    public void setTaxes(Double taxes) { this.taxes = taxes; }
    
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public LocalDateTime getPaymentDateTime() { return paymentDateTime; }
    public void setPaymentDateTime(LocalDateTime paymentDateTime) { this.paymentDateTime = paymentDateTime; }
}
