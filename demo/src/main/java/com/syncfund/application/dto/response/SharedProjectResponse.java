package com.syncfund.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SharedProjectResponse {
    private Long projectId;
    private String name;
    private String description;
    private double currentBalance; // commonFund
    private Long adminId;
    private List<Long> memberIds;
}
