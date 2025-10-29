package com.cabbooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;

@Repository
public interface RideRepository extends JpaRepository<Ride, Long> {
    List<Ride> findByPassenger(User passenger);
    List<Ride> findByDriver(User driver);
    List<Ride> findByStatus(Ride.RideStatus status);
    List<Ride> findByPassengerOrderByCreatedAtDesc(User passenger);
    List<Ride> findByDriverOrderByCreatedAtDesc(User driver);
    List<Ride> findByDriverAndStatusIn(User driver, List<Ride.RideStatus> statuses);
    List<Ride> findByDriverAndStatus(User driver, Ride.RideStatus status);
}
