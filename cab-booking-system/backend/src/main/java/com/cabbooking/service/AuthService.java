package com.cabbooking.service;

import com.cabbooking.dto.LoginRequest;
import com.cabbooking.dto.RegisterRequest;
import com.cabbooking.entity.Driver;
import com.cabbooking.entity.User;
import com.cabbooking.repository.DriverRepository;
import com.cabbooking.repository.UserRepository;
import com.cabbooking.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    public Map<String, Object> register(RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("success", false);
            response.put("message", "Email already exists");
            return response;
        }

        // Validate password length
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            response.put("success", false);
            response.put("message", "Password must be at least 6 characters long");
            return response;
        }

        // Create user
        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                request.getPhone(),
                request.getUserType()
        );

        User savedUser = userRepository.save(user);

        // If driver, create driver record
        if (request.getUserType() == User.UserType.DRIVER) {
            Driver driver = new Driver(
                    savedUser,
                    request.getVehicleNumber(),
                    request.getLicenseNumber()
            );
            driverRepository.save(driver);
        }

        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("userId", savedUser.getId());
        return response;
    }

    public Map<String, Object> login(LoginRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtUtil.generateToken(userDetails);

            User user = userRepository.findByEmail(request.getEmail()).orElse(null);

            response.put("success", true);
            response.put("token", token);
            response.put("userType", user.getUserType().toString());
            response.put("userId", user.getId());
            response.put("name", user.getName());

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Invalid credentials");
        }

        return response;
    }
}
