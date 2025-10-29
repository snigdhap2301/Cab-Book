-- Create the database
CREATE DATABASE IF NOT EXISTS cab_booking_db;
USE cab_booking_db;

-- Note: Spring Boot will automatically create the tables using JPA/Hibernate
-- This script is for reference only. The actual tables will be created automatically
-- when you run the Spring Boot application with spring.jpa.hibernate.ddl-auto=update

-- Users table 

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    user_type ENUM('PASSENGER', 'DRIVER') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


-- Drivers table 

CREATE TABLE drivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vehicle_number VARCHAR(50) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    rating DOUBLE DEFAULT 5.0,
    availability BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Rides table 

CREATE TABLE rides (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    passenger_id BIGINT NOT NULL,
    driver_id BIGINT,
    pickup_location VARCHAR(500) NOT NULL,
    drop_location VARCHAR(500) NOT NULL,
    distance_km DOUBLE NOT NULL,
    fare DOUBLE NOT NULL,
    status ENUM('REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') DEFAULT 'REQUESTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (passenger_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);


-- Payments table 
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    method ENUM('UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'CASH') NOT NULL,
    status ENUM('PENDING', 'PAID', 'FAILED') DEFAULT 'PENDING',
    amount DOUBLE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Ratings table 

CREATE TABLE ratings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ride_id BIGINT NOT NULL,
    passenger_id BIGINT NOT NULL,
    driver_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id),
    FOREIGN KEY (passenger_id) REFERENCES users(id),
    FOREIGN KEY (driver_id) REFERENCES users(id)
);

/*
-- Insert sample data (Optional - for testing)
-- You can uncomment and run this after the application creates the tables


-- Sample passengers
INSERT INTO users (name, email, password, phone, user_type) VALUES
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890', 'PASSENGER'),
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0987654321', 'PASSENGER');

-- Sample drivers
INSERT INTO users (name, email, password, phone, user_type) VALUES
('Mike Wilson', 'mike@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1122334455', 'DRIVER'),
('Sarah Johnson', 'sarah@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '5566778899', 'DRIVER');

-- Sample driver details
INSERT INTO drivers (user_id, vehicle_number, license_number) VALUES
(3, 'ABC123', 'DL123456789'),
(4, 'XYZ789', 'DL987654321');

*/
/*
-- Create indexes for better performance (Optional)

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_rides_passenger ON rides(passenger_id);
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_payments_ride ON payments(ride_id);
CREATE INDEX idx_ratings_ride ON ratings(ride_id);

*/