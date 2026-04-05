package com.tutoriq.model.dto

import com.tutoriq.model.entity.MessageRole
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

data class CreateTagRequest(
    @field:NotBlank @field:Size(max = 50) val name: String
)

data class TagResponse(
    val tagId: UUID,
    val name: String,
    val createdAt: LocalDateTime
)

data class TaggedMessageResponse(
    val messageId: UUID,
    val sessionId: UUID,
    val role: MessageRole,
    val content: String,
    val createdAt: LocalDateTime,
    val tags: List<TagResponse>
)

data class ApplyTagRequest(
    val tagId: UUID
)
