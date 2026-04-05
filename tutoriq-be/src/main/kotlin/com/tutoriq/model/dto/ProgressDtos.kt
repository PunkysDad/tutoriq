package com.tutoriq.model.dto

import com.tutoriq.model.entity.Subject
import com.tutoriq.model.entity.SubscriptionTier
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

data class SubjectProgressResponse(
    val subject: Subject,
    val sessionCount: Int,
    val totalMessages: Int,
    val lastActivityAt: LocalDateTime?
)

data class StreakResponse(
    val currentStreakDays: Int,
    val longestStreakDays: Int,
    val lastActiveDate: LocalDate?
)

data class ProgressDashboardResponse(
    val userId: UUID,
    val totalSessions: Int,
    val totalMessages: Int,
    val subjectBreakdown: List<SubjectProgressResponse>,
    val streak: StreakResponse,
    val exchangeCount: Int,
    val exchangeLimit: Int,
    val subscriptionTier: SubscriptionTier?
)
