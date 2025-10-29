package com.cabbooking.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.cabbooking.dto.ChangePasswordRequest;
import com.cabbooking.entity.User;
import com.cabbooking.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Map<String, Object> changePassword(ChangePasswordRequest request, String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOpt.get();

            // Validate current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                response.put("success", false);
                response.put("message", "Current password is incorrect");
                return response;
            }

            // Validate new password length
            if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
                response.put("success", false);
                response.put("message", "New password must be at least 6 characters long");
                return response;
            }

            // Check if new password is different from current
            if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
                response.put("success", false);
                response.put("message", "New password must be different from current password");
                return response;
            }

            // Update password
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);

            response.put("success", true);
            response.put("message", "Password changed successfully");

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to change password");
        }

        return response;
    }

    public Map<String, Object> getProfile(String userEmail) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOpt = userRepository.findByEmail(userEmail);
            if (userOpt.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOpt.get();
            response.put("success", true);
            response.put("user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "userType", user.getUserType().toString()
            ));

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to get profile");
        }

        return response;
    }
}
