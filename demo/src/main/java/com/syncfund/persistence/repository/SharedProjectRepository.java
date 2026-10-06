package com.syncfund.persistence.repository;

import com.syncfund.domain.model.SharedProject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SharedProjectRepository extends JpaRepository<SharedProject, Long> {
    List<SharedProject> findByMembers_Id(Long userId);
}
