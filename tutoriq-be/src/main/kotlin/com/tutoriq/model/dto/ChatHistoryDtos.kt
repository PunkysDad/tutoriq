package com.tutoriq.model.dto

import jakarta.validation.constraints.NotEmpty
import java.time.LocalDateTime
import java.util.UUID

data class ChatHistoryRequest(
    val sessionId: UUID
)

data class SummarizeRequest(
    @field:NotEmpty val messageIds: List<UUID>
)

data class SummarizeResponse(
    val summaryId: UUID,
    val summaryText: String,
    val messageCount: Int,
    val createdAt: LocalDateTime
)

data class SavedSummaryResponse(
    val summaryId: UUID,
    val summaryText: String,
    val messageCount: Int,
    val createdAt: LocalDateTime
)
