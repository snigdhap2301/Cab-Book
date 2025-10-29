package com.cabbooking.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "passenger_id", nullable = false)
    private User passenger;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "driver_id")
    @JsonManagedReference
    private User driver;
    
    @Column(name = "pickup_location", nullable = false)
    private String pickupLocation;
    
    @Column(name = "drop_location", nullable = false)
    private String dropLocation;
    
    @Column(name = "distance_km", nullable = false)
    private Double distanceKm;
    
    @Column(nullable = false)
    private Double fare;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideStatus status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Transient field for rating (not stored in database)
    @Transient
    private Double rating;
    
    public enum RideStatus {
        REQUESTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
    }
    
    // Constructors
    public Ride() {}
    
    public Ride(User passenger, String pickupLocation, String dropLocation, Double distanceKm, Double fare) {
        this.passenger = passenger;
        this.pickupLocation = pickupLocation;
        this.dropLocation = dropLocation;
        this.distanceKm = distanceKm;
        this.fare = fare;
        this.status = RideStatus.REQUESTED;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getPassenger() { return passenger; }
    public void setPassenger(User passenger) { this.passenger = passenger; }
    
    public User getDriver() { return driver; }
    public void setDriver(User driver) { this.driver = driver; }
    
    public String getPickupLocation() { return pickupLocation; }
    public void setPickupLocation(String pickupLocation) { this.pickupLocation = pickupLocation; }
    
    public String getDropLocation() { return dropLocation; }
    public void setDropLocation(String dropLocation) { this.dropLocation = dropLocation; }
    
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    
    public Double getFare() { return fare; }
    public void setFare(Double fare) { this.fare = fare; }
    
    public RideStatus getStatus() { return status; }
    public void setStatus(RideStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    // Rating getter and setter (transient field)
    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
