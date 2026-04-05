package com.tutoriq.model.dto

import com.tutoriq.model.entity.MessageRole
import com.tutoriq.model.entity.Subject
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime
import java.util.UUID

data class StartSessionRequest(
    @field:NotNull val subject: Subject,
    @field:NotNull val gradeLevel: Int
)

data class StartSessionResponse(
    val sessionId: UUID,
    val subject: Subject,
    val gradeLevel: Int,
    val startedAt: LocalDateTime
)

data class SendMessageRequest(
    @field:NotNull val sessionId: UUID,
    @field:NotBlank val message: String
)

data class TutorMessageResponse(
    val messageId: UUID,
    val role: MessageRole,
    val content: String,
    val createdAt: LocalDateTime
)

data class SessionSummaryResponse(
    val sessionId: UUID,
    val subject: Subject,
    val gradeLevel: Int,
    val startedAt: LocalDateTime,
    val messageCount: Int
)
