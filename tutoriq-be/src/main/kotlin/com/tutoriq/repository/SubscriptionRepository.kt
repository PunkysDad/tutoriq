package com.tutoriq.repository

import com.tutoriq.model.entity.Subscription
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SubscriptionRepository : JpaRepository<Subscription, UUID> {
    fun findByUserId(userId: UUID): Subscription?
}
