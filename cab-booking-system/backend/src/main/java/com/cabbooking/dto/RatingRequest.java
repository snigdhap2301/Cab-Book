package com.cabbooking.dto;

public class RatingRequest {
    private Long rideId;
    private Integer rating;
    private String comments;
    
    // Constructors
    public RatingRequest() {}
    
    public RatingRequest(Long rideId, Integer rating, String comments) {
        this.rideId = rideId;
        this.rating = rating;
        this.comments = comments;
    }
    
    // Getters and Setters
    public Long getRideId() { return rideId; }
    public void setRideId(Long rideId) { this.rideId = rideId; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
