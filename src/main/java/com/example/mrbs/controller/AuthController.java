package com.example.mrbs.controller;

import com.example.mrbs.config.JwtTokenProvider;
import com.example.mrbs.dto.JwtResponse;
import com.example.mrbs.dto.LoginRequest;
import com.example.mrbs.dto.SignupRequest;
import com.example.mrbs.exception.EmailDomainException;
import com.example.mrbs.model.User;
import com.example.mrbs.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return ResponseEntity.ok(new JwtResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Validate email domain
        String email = signUpRequest.getEmail();
        if (!email.endsWith("@jadeglobal.com") && !email.endsWith("@kanverse.com")) {
            throw new EmailDomainException("Email domain not allowed. Only @jadeglobal.com or @kanverse.com are accepted.");
        }

        // Create new user
        User user = userService.createUser(signUpRequest);

        return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
    }
}