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

    /** Lo que ve un compañero de proyecto: los mismos campos, sin revelar el saldo real. */
    public UserResponse toProjectMemberResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                0.0
        );
    }
}
