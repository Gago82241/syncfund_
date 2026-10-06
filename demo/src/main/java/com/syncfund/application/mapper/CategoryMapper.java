package com.syncfund.application.mapper;

import com.syncfund.application.dto.response.CategoryResponse;
import com.syncfund.domain.model.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {
    public CategoryResponse toResponse(Category category) {
        return new CategoryResponse(
                category.getCategoryId(),
                category.getName(),
                category.getMonthlyLimit()
        );
    }
}
