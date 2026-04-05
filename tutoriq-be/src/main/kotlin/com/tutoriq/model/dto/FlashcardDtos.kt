package com.tutoriq.model.dto

import com.tutoriq.model.entity.Subject
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.time.LocalDateTime
import java.util.UUID

data class CreateDeckRequest(
    @field:NotBlank @field:Size(max = 100) val title: String,
    @field:NotNull val subject: Subject
)

data class UpdateDeckRequest(
    @field:NotBlank @field:Size(max = 100) val title: String
)

data class DeckResponse(
    val deckId: UUID,
    val title: String,
    val subject: Subject,
    val cardCount: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class CreateCardRequest(
    @field:NotBlank @field:Size(max = 1000) val question: String,
    @field:NotBlank @field:Size(max = 1000) val answer: String
)

data class UpdateCardRequest(
    @field:NotBlank @field:Size(max = 1000) val question: String,
    @field:NotBlank @field:Size(max = 1000) val answer: String
)

data class CardResponse(
    val cardId: UUID,
    val deckId: UUID,
    val question: String,
    val answer: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

data class DeckWithCardsResponse(
    val deck: DeckResponse,
    val cards: List<CardResponse>
)
