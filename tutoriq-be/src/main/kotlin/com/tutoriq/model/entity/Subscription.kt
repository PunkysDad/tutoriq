package com.tutoriq.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "subscriptions")
class Subscription(

    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val tier: SubscriptionTier,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: SubscriptionStatus,

    @Column(name = "exchange_count", nullable = false)
    var exchangeCount: Int = 0,

    @Column(name = "exchange_limit", nullable = false)
    val exchangeLimit: Int,

    @Column(name = "started_at")
    val startedAt: LocalDateTime? = null,

    @Column(name = "expires_at")
    val expiresAt: LocalDateTime? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now()
) {

    @PrePersist
    fun onPrePersist() {
        val now = LocalDateTime.now()
        createdAt = now
        updatedAt = now
    }

    @PreUpdate
    fun onPreUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
