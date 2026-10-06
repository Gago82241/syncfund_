package com.syncfund.presentation.controller;

import com.syncfund.application.dto.request.UpdateUserRequest;
import com.syncfund.application.dto.response.UserResponse;
import com.syncfund.application.service.UserAppService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/** User: consulta, updateData(), getGeneralSummary(). */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserAppService userAppService;

    public UserController(UserAppService userAppService) {
        this.userAppService = userAppService;
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userAppService.findById(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userAppService.update(id, request);
    }

    @GetMapping("/{id}/summary")
    public double getGeneralSummary(@PathVariable Long id) {
        return userAppService.getGeneralSummary(id);
    }
}
