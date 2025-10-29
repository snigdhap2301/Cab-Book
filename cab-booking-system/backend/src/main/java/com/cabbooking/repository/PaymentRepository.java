package com.cabbooking.repository;

import com.cabbooking.entity.Payment;
import com.cabbooking.entity.Ride;
import com.cabbooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByRide(Ride ride);
    List<Payment> findByUser(User user);
}
