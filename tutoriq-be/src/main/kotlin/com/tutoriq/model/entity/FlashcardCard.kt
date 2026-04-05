package com.tutoriq.model.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "flashcard_cards")
class FlashcardCard(

    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "deck_id", nullable = false)
    val deckId: UUID,

    @Column(nullable = false, columnDefinition = "TEXT")
    var question: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var answer: String,

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
