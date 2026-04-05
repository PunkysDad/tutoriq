package com.tutoriq.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "chat_summaries")
class ChatSummary(

    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "user_id", nullable = false)
    val userId: UUID,

    @Column(name = "summary_text", columnDefinition = "TEXT")
    val summaryText: String,

    @Column(name = "message_ids", columnDefinition = "TEXT")
    val messageIds: String,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
) {

    @PrePersist
    fun onPrePersist() {
        createdAt = LocalDateTime.now()
    }
}
