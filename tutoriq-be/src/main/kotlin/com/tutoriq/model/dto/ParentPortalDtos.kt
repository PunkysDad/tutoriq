package com.tutoriq.model.dto

import com.tutoriq.model.entity.Subject
import com.tutoriq.model.entity.SubscriptionStatus
import com.tutoriq.model.entity.SubscriptionTier
import java.time.LocalDateTime
import java.util.UUID

data class ChildSummaryResponse(
    val childId: UUID,
    val firstName: String,
    val lastName: String,
    val gradeLevel: Int?,
    val subscriptionTier: SubscriptionTier?,
    val subscriptionStatus: SubscriptionStatus?,
    val totalSessions: Int,
    val totalMessages: Int,
    val questionCount: Int,
    val subjectBreakdown: Map<String, Int>
)

data class ChildSessionResponse(
    val sessionId: UUID,
    val subject: Subject,
    val gradeLevel: Int,
    val startedAt: LocalDateTime,
    val messageCount: Int
)

data class ChildActivityResponse(
    val child: ChildSummaryResponse,
    val recentSessions: List<ChildSessionResponse>
)
