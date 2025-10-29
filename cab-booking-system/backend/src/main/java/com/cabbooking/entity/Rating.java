package com.cabbooking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ratings")
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "ride_id", nullable = false)
    private Ride ride;
    
    @ManyToOne
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;
    
    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;
    
    @Column(nullable = false)
    private Integer rating;
    
    @Column(columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public Rating() {}
    
    public Rating(Ride ride, User passenger, User driver, Integer rating, String comments) {
        this.ride = ride;
        this.passenger = passenger;
        this.driver = driver;
        this.rating = rating;
        this.comments = comments;
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Ride getRide() { return ride; }
    public void setRide(Ride ride) { this.ride = ride; }
    
    public User getPassenger() { return passenger; }
    public void setPassenger(User passenger) { this.passenger = passenger; }
    
    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }
    
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
