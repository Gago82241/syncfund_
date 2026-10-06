package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.LoginRequest;
import com.syncfund.application.dto.request.RegisterUserRequest;
import com.syncfund.application.dto.response.AuthResponse;
import com.syncfund.application.dto.response.UserResponse;
import com.syncfund.application.service.UserAppService;
import com.syncfund.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/** User.login() / registro — ahora devuelve también el JWT que React debe reenviar en cada petición. */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserAppService userAppService;
    private final JwtService jwtService;

    public AuthController(UserAppService userAppService, JwtService jwtService) {
        this.userAppService = userAppService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse user = userAppService.register(request);
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(token, user));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        UserResponse user = userAppService.login(request);
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user));
    }
}
