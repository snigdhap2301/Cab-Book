package com.cabbooking.dto;

public class BookRideRequest {
    private String pickupLocation;
    private String dropLocation;
    
    // Constructors
    public BookRideRequest() {}
    
    public BookRideRequest(String pickupLocation, String dropLocation) {
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
    }
    
    // Getters and Setters
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
}
