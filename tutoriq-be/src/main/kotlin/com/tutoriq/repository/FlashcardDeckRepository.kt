package com.tutoriq.repository

import com.tutoriq.model.entity.FlashcardDeck
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface FlashcardDeckRepository : JpaRepository<FlashcardDeck, UUID> {
    fun findByUserId(userId: UUID): List<FlashcardDeck>
    fun findByIdAndUserId(id: UUID, userId: UUID): FlashcardDeck?
}
