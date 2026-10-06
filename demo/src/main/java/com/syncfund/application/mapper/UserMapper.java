package com.syncfund.application.mapper;

import com.syncfund.application.dto.response.UserResponse;
import com.syncfund.domain.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getGeneralSummary()
        );
    }
}
