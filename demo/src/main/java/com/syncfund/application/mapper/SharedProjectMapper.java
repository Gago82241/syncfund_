package com.syncfund.application.mapper;

import com.syncfund.application.dto.response.SharedProjectResponse;
import com.syncfund.domain.model.SharedProject;
import com.syncfund.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SharedProjectMapper {
    public SharedProjectResponse toResponse(SharedProject project) {
        List<Long> memberIds = project.getMembers().stream().map(User::getId).toList();
        return new SharedProjectResponse(
                project.getProjectId(),
                project.getName(),
                project.getDescription(),
                project.getCurrentBalance(),
                project.getAdmin() != null ? project.getAdmin().getId() : null,
                memberIds
        );
    }
}
