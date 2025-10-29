package com.cabbooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cabbooking.entity.Rating;
import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByRide(Ride ride);
    List<Rating> findByDriver(User driver);
    List<Rating> findByPassenger(User passenger);
}
