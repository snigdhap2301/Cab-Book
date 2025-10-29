package com.cabbooking.controller;

import com.cabbooking.dto.ChangePasswordRequest;
import com.cabbooking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<Map<String, Object>> changePassword(@RequestBody ChangePasswordRequest request) {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = userService.changePassword(request, userEmail);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Map<String, Object> response = userService.getProfile(userEmail);
        return ResponseEntity.ok(response);
    }
}
