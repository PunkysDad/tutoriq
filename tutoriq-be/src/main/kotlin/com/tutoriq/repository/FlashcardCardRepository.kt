package com.tutoriq.repository

import com.tutoriq.model.entity.FlashcardCard
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface FlashcardCardRepository : JpaRepository<FlashcardCard, UUID> {
    fun findByDeckId(deckId: UUID): List<FlashcardCard>
    fun findByIdAndDeckId(id: UUID, deckId: UUID): FlashcardCard?
    fun deleteByDeckId(deckId: UUID)
    fun countByDeckId(deckId: UUID): Int
}
