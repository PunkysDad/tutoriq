package com.tutoriq.repository

import com.tutoriq.model.entity.TrialUsage
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface TrialUsageRepository : JpaRepository<TrialUsage, UUID> {
    fun findByUserId(userId: UUID): TrialUsage?
}
